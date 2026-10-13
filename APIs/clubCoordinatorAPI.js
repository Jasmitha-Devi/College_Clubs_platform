```javascript
import exp from 'express'
import {ClubCoordinatorModel} from '../schema/clubCoordinatorModel.js'
import {EventModel} from '../schema/eventModel.js'
import {StudentModel} from '../schema/studentModel.js'
import {FacultyCoordinatorModel} from '../schema/facultyCoordinatorModel.js'
import {ClubModel} from '../schema/clubModel.js'
export const clubCoordinatorRouter=exp.Router()
clubCoordinatorRouter.get("/clubs/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let coordinator=await ClubCoordinatorModel.findById(idOfReq).select("-password")
        if(!coordinator){
            return res.status(404).json({
                success:false,message:"Club coordinator not found"
            })
        }
        res.status(200).json({
            success:true,message:"Assigned clubs displayed",data:coordinator.clubs
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Invalid coordinator ID"
        })
    }
})
clubCoordinatorRouter.get("/coordinator/:id/events",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let coordinator=await ClubCoordinatorModel.findById(idOfReq)
        if(!coordinator){
            return res.status(404).json({
                success:false,message:"Club coordinator not found"
            })
        }
        let events=await EventModel.find({_id:{$in:coordinator.managedEvents}})
        res.status(200).json({
            success:true,message:"Managed events displayed",data:events
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to fetch managed events"
        })
    }
})
clubCoordinatorRouter.post("/coordinator/:id/events",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let coordinator=await ClubCoordinatorModel.findById(idOfReq)
        if(!coordinator){
            return res.status(404).json({
                success:false,message:"Club coordinator not found"
            })
        }
        let newEvent=req.body
        let facultyID=newEvent.facultyCoordinator
        let faculty=await FacultyCoordinatorModel.findById(facultyID)
        if(!faculty){
            return res.status(404).json({
                success:false,message:"Faculty coordinator not found"
            })
        }
        if(newEvent.club){
            let clubID=newEvent.club
            let club=await ClubModel.findById(clubID)
            if(!club){
                return res.status(404).json({
                    success:false,message:"Club not found"
                })
            }
            if(club.clubCoordinator.toString()!==coordinator._id.toString()){
                return res.status(400).json({
                    success:false,message:"This club is not assigned to this coordinator"
                })
            }
        }
        let eventDocument=await EventModel.create(newEvent)
        coordinator.managedEvents.push(eventDocument._id.toString())
        await coordinator.save()
        res.status(201).json({
            success:true,message:"Event created successfully",data:eventDocument
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to create event"
        })
    }
})
clubCoordinatorRouter.get("/events",async(req,res)=>{
    try{
        let events=await EventModel.find()
        res.status(200).json({
            success:true,message:"Events displayed",data:events
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to fetch events"
        })
    }
})
clubCoordinatorRouter.get("/event/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let event=await EventModel.findById(idOfReq)
        if(!event){
            return res.status(404).json({
                success:false,message:"Event not found"
            })
        }
        res.status(200).json({
            success:true,message:"Event found",data:event
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Invalid event ID"
        })
    }
})
clubCoordinatorRouter.put("/coordinator/:coordinatorid/event/:eventid",async(req,res)=>{
    try{
        let coordinatorID=req.params.coordinatorid
        let eventID=req.params.eventid
        let coordinator=await ClubCoordinatorModel.findById(coordinatorID)
        if(!coordinator){
            return res.status(404).json({
                success:false,message:"Club coordinator not found"
            })
        }
        let event=await EventModel.findById(eventID)
        if(!event){
            return res.status(404).json({
                success:false,message:"Event not found"
            })
        }
        let isManaged=false
        for(let managedEventID of coordinator.managedEvents){
            if(managedEventID.toString()===event._id.toString()){
                isManaged=true
                break
            }
        }
        if(!isManaged){
            return res.status(400).json({
                success:false,message:"You cannot update this event"
            })
        }
        if(req.body.eventName!==undefined){
            event.eventName=req.body.eventName
        }
        if(req.body.organisers!==undefined){
            event.organisers=req.body.organisers
        }
        if(req.body.department!==undefined){
            event.department=req.body.department
        }
        await event.save()
        res.status(200).json({
            success:true,message:"Event updated successfully",data:event
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to update event"
        })
    }
})
clubCoordinatorRouter.delete("/coordinator/:coordinatorid/event/:eventid",async(req,res)=>{
    try{
        let coordinatorID=req.params.coordinatorid
        let eventID=req.params.eventid
        let coordinator=await ClubCoordinatorModel.findById(coordinatorID)
        if(!coordinator){
            return res.status(404).json({
                success:false,message:"Club coordinator not found"
            })
        }
        let event=await EventModel.findById(eventID)
        if(!event){
            return res.status(404).json({
                success:false,message:"Event not found"
            })
        }
        let isManaged=false
        for(let managedEventID of coordinator.managedEvents){
            if(managedEventID.toString()===event._id.toString()){
                isManaged=true
                break
            }
        }
        if(!isManaged){
            return res.status(400).json({
                success:false,message:"You cannot delete this event"
            })
        }
        for(let studentID of event.registeredStudents){
            let student=await StudentModel.findById(studentID)
            if(student){
                let updatedEvents=[]
                for(let registeredEventID of student.registeredEvents){
                    if(registeredEventID.toString()!==event._id.toString()){
                        updatedEvents.push(registeredEventID)
                    }
                }
                student.registeredEvents=updatedEvents
                let updatedParticipatedEvents=[]
                for(let participatedEventID of student.participatedEvents){
                    if(participatedEventID.toString()!==event._id.toString()){
                        updatedParticipatedEvents.push(participatedEventID)
                    }
                }
                student.participatedEvents=updatedParticipatedEvents
                let updatedEventsWon=[]
                for(let wonEventID of student.eventsWon){
                    if(wonEventID.toString()!==event._id.toString()){
                        updatedEventsWon.push(wonEventID)
                    }
                }
                student.eventsWon=updatedEventsWon
                await student.save()
            }
        }
        coordinator.managedEvents=coordinator.managedEvents.filter((id)=>id.toString()!==event._id.toString())
        await coordinator.save()
        await EventModel.findByIdAndDelete(eventID)
        res.status(200).json({
            success:true,message:"Event deleted successfully"
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to delete event"
        })
    }
})
clubCoordinatorRouter.get("/coordinator/:coordinatorid/event/:eventid/students",async(req,res)=>{
    try{
        let coordinatorID=req.params.coordinatorid
        let eventID=req.params.eventid
        let coordinator=await ClubCoordinatorModel.findById(coordinatorID)
        if(!coordinator){
            return res.status(404).json({
                success:false,message:"Club coordinator not found"
            })
        }
        let event=await EventModel.findById(eventID)
        if(!event){
            return res.status(404).json({
                success:false,message:"Event not found"
            })
        }
        let isManaged=false
        for(let managedEventID of coordinator.managedEvents){
            if(managedEventID.toString()===event._id.toString()){
                isManaged=true
                break
            }
        }
        if(!isManaged){
            return res.status(400).json({
                success:false,message:"You cannot view students for this event"
            })
        }
        let students=await StudentModel.find({_id:{$in:event.registeredStudents}}).select("-password")
        res.status(200).json({
            success:true,message:"Registered students displayed",data:students
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to fetch registered students"
        })
    }
})
clubCoordinatorRouter.get("/profile/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let coordinator=await ClubCoordinatorModel.findById(idOfReq).select("-password")
        if(!coordinator){
            return res.status(404).json({
                success:false,message:"Club coordinator not found"
            })
        }
        res.status(200).json({
            success:true,message:"Coordinator profile displayed",data:coordinator
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Invalid coordinator ID"
        })
    }
})
clubCoordinatorRouter.put("/profile/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let coordinator=await ClubCoordinatorModel.findById(idOfReq)
        if(!coordinator){
            return res.status(404).json({
                success:false,message:"Club coordinator not found"
            })
        }
        if(req.body.firstName!==undefined){
            coordinator.firstName=req.body.firstName
        }
        if(req.body.lastName!==undefined){
            coordinator.lastName=req.body.lastName
        }
        if(req.body.department!==undefined){
            coordinator.department=req.body.department
        }
        if(req.body.section!==undefined){
            coordinator.section=req.body.section
        }
        if(req.body.year!==undefined){
            coordinator.year=req.body.year
        }
        if(req.body.email!==undefined){
            coordinator.email=req.body.email
        }
        if(req.body.phoneNumber!==undefined){
            coordinator.phoneNumber=req.body.phoneNumber
        }
        await coordinator.save()
        res.status(200).json({
            success:true,message:"Coordinator profile updated",data:{
                _id:coordinator._id,
                firstName:coordinator.firstName,
                lastName:coordinator.lastName,
                rollNumber:coordinator.rollNumber,
                department:coordinator.department,
                section:coordinator.section,
                year:coordinator.year,
                email:coordinator.email,
                phoneNumber:coordinator.phoneNumber,
                active:coordinator.active,
                clubs:coordinator.clubs,
                managedEvents:coordinator.managedEvents
            }
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to update coordinator profile"
        })
    }
})
```