import exp from 'express'
import {EventModel} from '../schema/eventModel.js'
import {StudentModel} from '../schema/studentModel.js'
import {FacultyCoordinatorModel} from '../schema/facultyCoordinatorModel.js'
import {ClubModel} from '../schema/clubModel.js'
export const eventRouter=exp.Router()

eventRouter.post("/",async(req,res)=>{
    try{
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
        }

        let eventDocument=await EventModel.create(newEvent)

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

eventRouter.get("/department/:department",async(req,res)=>{
    try{
        let departmentName=req.params.department
        let events=await EventModel.find({
            department:departmentName
        })

        res.status(200).json({
            success:true,message:"Department events displayed",data:events
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to fetch department events"
        })
    }
})

eventRouter.get("/faculty/:facultyid",async(req,res)=>{
    try{
        let facultyID=req.params.facultyid
        let faculty=await FacultyCoordinatorModel.findById(facultyID)

        if(!faculty){
            return res.status(404).json({
                success:false,message:"Faculty coordinator not found"
            })
        }

        let events=await EventModel.find({
            facultyCoordinator:facultyID
        })

        res.status(200).json({
            success:true,message:"Faculty coordinator events displayed",data:events
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to fetch faculty events"
        })
    }
})

eventRouter.get("/club/:clubid",async(req,res)=>{
    try{
        let clubID=req.params.clubid
        let club=await ClubModel.findById(clubID)

        if(!club){
            return res.status(404).json({
                success:false,message:"Club not found"
            })
        }

        let events=await EventModel.find({
            club:clubID
        })

        res.status(200).json({
            success:true,message:"Club events displayed",data:events
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to fetch club events"
        })
    }
})

eventRouter.get("/:id/students",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let event=await EventModel.findById(idOfReq)

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
            success:false,message:"Failed to fetch registered students"
        })
    }
})

eventRouter.get("/",async(req,res)=>{
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

eventRouter.get("/:id",async(req,res)=>{
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

eventRouter.put("/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let event=await EventModel.findById(idOfReq)

        if(!event){
            return res.status(404).json({
                success:false,message:"Event not found"
            })
        }

        if(req.body.facultyCoordinator!==undefined){
            let facultyID=req.body.facultyCoordinator
            let faculty=await FacultyCoordinatorModel.findById(facultyID)

            if(!faculty){
                return res.status(404).json({
                    success:false,message:"Faculty coordinator not found"
                })
            }

            event.facultyCoordinator=facultyID
        }

        if(req.body.club!==undefined){
            let clubID=req.body.club

            if(clubID){
                let club=await ClubModel.findById(clubID)

                if(!club){
                    return res.status(404).json({
                        success:false,message:"Club not found"
                    })
                }
            }

            event.club=clubID || undefined
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

eventRouter.delete("/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let event=await EventModel.findById(idOfReq)

        if(!event){
            return res.status(404).json({
                success:false,message:"Event not found"
            })
        }

        // Remove event references from students
        let students=await StudentModel.find({
            $or:[
                {registeredEvents:event._id},
                {participatedEvents:event._id},
                {eventsWon:event._id}
            ]
        })

        for(let student of students){
            let updatedRegisteredEvents=[]
            for(let eventID of student.registeredEvents){
                if(eventID.toString()!==event._id.toString()){
                    updatedRegisteredEvents.push(eventID)
                }
            }
            student.registeredEvents=updatedRegisteredEvents

            let updatedParticipatedEvents=[]
            for(let eventID of student.participatedEvents){
                if(eventID.toString()!==event._id.toString()){
                    updatedParticipatedEvents.push(eventID)
                }
            }
            student.participatedEvents=updatedParticipatedEvents

            let updatedEventsWon=[]
            for(let eventID of student.eventsWon){
                if(eventID.toString()!==event._id.toString()){
                    updatedEventsWon.push(eventID)
                }
            }
            student.eventsWon=updatedEventsWon

            await student.save()
        }

        await EventModel.findByIdAndDelete(idOfReq)

        res.status(200).json({
            success:true,message:"Event deleted successfully",data:event
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to delete event"
        })
    }
})

eventRouter.post("/:id/register/:studentid",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let studentID=req.params.studentid
        let event=await EventModel.findById(idOfReq)

        if(!event){
            return res.status(404).json({
                success:false,message:"Event not found"
            })
        }

        let student=await StudentModel.findById(studentID)

        if(!student){
            return res.status(404).json({
                success:false,message:"Student not found"
            })
        }

        let alreadyRegistered=await EventModel.findOne({
            _id:idOfReq,
            registeredStudents:student._id
        })

        if(alreadyRegistered){
            return res.status(400).json({
                success:false,message:"Student is already registered"
            })
        }

        event.registeredStudents.push(student._id)
        student.registeredEvents.push(event._id)

        await event.save()
        await student.save()

        res.status(200).json({
            success:true,message:"Student registered successfully",data:event
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to register student"
        })
    }
})

eventRouter.delete("/:id/unregister/:studentid",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let studentID=req.params.studentid
        let event=await EventModel.findById(idOfReq)

        if(!event){
            return res.status(404).json({
                success:false,message:"Event not found"
            })
        }

        let student=await StudentModel.findById(studentID)

        if(!student){
            return res.status(404).json({
                success:false,message:"Student not found"
            })
        }

        let alreadyRegistered=await EventModel.findOne({
            _id:idOfReq,
            registeredStudents:student._id
        })

        if(!alreadyRegistered){
            return res.status(400).json({
                success:false,message:"Student is not registered for this event"
            })
        }

        let updatedStudents=[]
        for(let registeredStudentID of event.registeredStudents){
            if(registeredStudentID.toString()!==student._id.toString()){
                updatedStudents.push(registeredStudentID)
            }
        }

        let updatedEvents=[]
        for(let registeredEventID of student.registeredEvents){
            if(registeredEventID.toString()!==event._id.toString()){
                updatedEvents.push(registeredEventID)
            }
        }

        event.registeredStudents=updatedStudents
        student.registeredEvents=updatedEvents

        await event.save()
        await student.save()

        res.status(200).json({
            success:true,message:"Student unregistered successfully",data:event
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to unregister student"
        })
    }
})
