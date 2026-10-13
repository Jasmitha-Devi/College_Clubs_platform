import exp from 'express'
import {FacultyCoordinatorModel} from '../schema/facultyCoordinatorModel.js'
import {EventModel} from '../schema/eventModel.js'
import { StudentModel } from '../schema/studentModel.js'
import {ClubCoordinatorModel} from '../schema/clubCoordinatorModel.js'
export const facultyRouter=exp.Router()
facultyRouter.post("/faculty",async(req,res)=>{
    try{
        let newFaculty=req.body
        let facultyDocument=await FacultyCoordinatorModel.create(newFaculty)
        res.status(201).json({
            success:true,message:"Faculty created",data:facultyDocument
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to create faculty"
        })
    }
})
facultyRouter.get("/events",async(req,res)=>{
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
facultyRouter.get("/event/:id",async(req,res)=>{
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
facultyRouter.post("/events", async (req, res) => {
    try {
        let newEvent = req.body
        let faculty = await FacultyCoordinatorModel.findById(
            newEvent.facultyCoordinator
        )
        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: "Faculty coordinator not found"
            })
        }
        let eventDocument = await EventModel.create(newEvent)
        res.status(201).json({
            success: true,
            message: "Event created",
            data: eventDocument
        })
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: "Failed to create event"
        })
    }
})
facultyRouter.put("/events/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let updatedEvent=await EventModel.findById(idOfReq)
        if(!updatedEvent){
            return res.status(404).json({
                success:false,message:"Event not found"
            })
        }
        if(req.body.eventName!==undefined){
            updatedEvent.eventName=req.body.eventName
        }
        if(req.body.organisers!==undefined){
            updatedEvent.organisers=req.body.organisers
        }
        if(req.body.department!==undefined){
            updatedEvent.department=req.body.department
        }
        await updatedEvent.save()
        res.status(200).json({
            success:true,message:"Event updated",data:updatedEvent
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to update event"
        })
    }
})
facultyRouter.delete("/events/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let deletedEvent=await EventModel.findById(idOfReq)
        if(!deletedEvent){
            return res.status(404).json({
                success:false,message:"Event not found"
            })
        }
        for(let studentID of deletedEvent.registeredStudents){
            let student=await StudentModel.findById(studentID)
            if(student){
                let updatedRegisteredEvents=[]
                for(let registeredEventID of student.registeredEvents){
                    if(registeredEventID.toString()!==deletedEvent._id.toString()){
                        updatedRegisteredEvents.push(registeredEventID)
                    }
                }
                student.registeredEvents=updatedRegisteredEvents
                let updatedParticipatedEvents=[]
                for(let participatedEventID of student.participatedEvents){
                    if(participatedEventID.toString()!==deletedEvent._id.toString()){
                        updatedParticipatedEvents.push(participatedEventID)
                    }
                }
                student.participatedEvents=updatedParticipatedEvents
                let updatedEventsWon=[]
                for(let wonEventID of student.eventsWon){
                    if(wonEventID.toString()!==deletedEvent._id.toString()){
                        updatedEventsWon.push(wonEventID)
                    }
                }
                student.eventsWon=updatedEventsWon
                await student.save()
            }
        }
        let eventCoordinators=await ClubCoordinatorModel.find({
            managedEvents:deletedEvent._id.toString()
        })
        for(let eventCoordinator of eventCoordinators){
            let updatedManagedEvents=[]
            for(let managedEventID of eventCoordinator.managedEvents){
                if(managedEventID.toString()!==deletedEvent._id.toString()){
                    updatedManagedEvents.push(managedEventID)
                }
            }
            eventCoordinator.managedEvents=updatedManagedEvents
            await eventCoordinator.save()
        }
        await EventModel.findByIdAndDelete(idOfReq)
        res.status(200).json({
            success:true,message:"Event deleted successfully"
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Invalid event ID"
        })
    }
})
facultyRouter.get("/events/:eventid/students",async(req,res)=>{
    try{
        let eventID=req.params.eventid
        let event=await EventModel.findById(eventID)
        if(!event){
            return res.status(404).json({
                success:false,message:"Event not found"
            })
        }
        let students=await StudentModel.find({
            _id:{$in:event.registeredStudents}
        }).select("-password")
        res.status(200).json({
            success:true,message:"Registered students displayed",data:students
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to fetch students"
        })
    }
})
facultyRouter.get("/faculty/:facultyid/events",async(req,res)=>{
    try{
        let facultyID=req.params.facultyid
        let events=await EventModel.find({facultyCoordinator:facultyID})
        res.status(200).json({
            success:true,message:"Faculty events displayed",data:events
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to fetch faculty events"
        })
    }
})
