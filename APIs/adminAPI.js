import exp from 'express'
import {HodModel} from '../schema/hodModel.js'
import {StudentModel} from '../schema/studentModel.js'
import {FacultyCoordinatorModel} from '../schema/facultyCoordinatorModel.js'
import {ClassCoordinatorModel} from '../schema/classCoordinatorModel.js'
import {ClubCoordinatorModel} from '../schema/clubCoordinatorModel.js'
import {EventModel} from '../schema/eventModel.js'
import {ClubModel} from '../schema/clubModel.js'
export const adminRouter=exp.Router()
// HOD OPERATIONS
adminRouter.post("/hods",async(req,res)=>{
    try{
        let newHod=req.body
        let hodDocument=await HodModel.create(newHod)
        res.status(201).json({
            success:true,message:"HOD created",data:hodDocument
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to create HOD"
        })
    }
})
adminRouter.get("/hods",async(req,res)=>{
    try{
        let hods=await HodModel.find().select("-password")
        res.status(200).json({
            success:true,message:"HODs displayed",data:hods
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to fetch HODs"
        })
    }
})
adminRouter.get("/hod/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let hod=await HodModel.findById(idOfReq).select("-password")
        if(!hod){
            return res.status(404).json({
                success:false,message:"HOD not found"
            })
        }
        res.status(200).json({
            success:true,message:"HOD found",data:hod
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Invalid HOD ID"
        })
    }
})
adminRouter.put("/hod/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let hod=await HodModel.findById(idOfReq)
        if(!hod){
            return res.status(404).json({
                success:false,message:"HOD not found"
            })
        }
        hod.hodID=req.body.hodID
        hod.firstName=req.body.firstName
        hod.lastName=req.body.lastName
        hod.department=req.body.department
        hod.email=req.body.email
        hod.phoneNumber=req.body.phoneNumber
        hod.active=req.body.active
        await hod.save()
        res.status(200).json({
            success:true,message:"HOD updated",data:hod
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to update HOD"
        })
    }
})
adminRouter.delete("/hod/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let deletedHod=await HodModel.findByIdAndDelete(idOfReq)
        if(!deletedHod){
            return res.status(404).json({
                success:false,message:"HOD not found"
            })
        }
        res.status(200).json({
            success:true,message:"HOD deleted successfully"
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Invalid HOD ID"
        })
    }
})
// STUDENT OPERATIONS
adminRouter.get("/students",async(req,res)=>{
    try{
        let students=await StudentModel.find().select("-password")
        res.status(200).json({
            success:true,message:"Students displayed",data:students
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to fetch students"
        })
    }
})
adminRouter.get("/student/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let student=await StudentModel.findById(idOfReq).select("-password")
        if(!student){
            return res.status(404).json({
                success:false,message:"Student not found"
            })
        }
        res.status(200).json({
            success:true,message:"Student found",data:student
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Invalid student ID"
        })
    }
})
adminRouter.put("/student/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let student=await StudentModel.findById(idOfReq)
        if(!student){
            return res.status(404).json({
                success:false,message:"Student not found"
            })
        }
        student.firstName=req.body.firstName
        student.lastName=req.body.lastName
        student.rollNumber=req.body.rollNumber
        student.department=req.body.department
        student.section=req.body.section
        student.year=req.body.year
        student.email=req.body.email
        student.phoneNumber=req.body.phoneNumber
        student.active=req.body.active
        await student.save()
        res.status(200).json({
            success:true,message:"Student updated",data:student
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to update student"
        })
    }
})
adminRouter.delete("/student/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id

        let deletedStudent=await StudentModel.findById(idOfReq)

        if(!deletedStudent){
            return res.status(404).json({
                success:false,message:"Student not found"
            })
        }

        // Remove student from club memberships
        let clubs=await ClubModel.find({
            members:deletedStudent._id
        })

        for(let club of clubs){
            let updatedMembers=[]
            for(let memberID of club.members){
                if(memberID.toString()!==deletedStudent._id.toString()){
                    updatedMembers.push(memberID)
                }
            }
            club.members=updatedMembers
            await club.save()
        }

        // Remove student from event registrations
        let events=await EventModel.find({
            registeredStudents:deletedStudent._id
        })

        for(let event of events){
            let updatedRegisteredStudents=[]
            for(let studentID of event.registeredStudents){
                if(studentID.toString()!==deletedStudent._id.toString()){
                    updatedRegisteredStudents.push(studentID)
                }
            }
            event.registeredStudents=updatedRegisteredStudents
            await event.save()
        }

        // Delete the student
        await StudentModel.findByIdAndDelete(idOfReq)

        res.status(200).json({
            success:true,message:"Student deleted successfully"
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to delete student"
        })
    }
})

// FACULTY COORDINATOR OPERATIONS
adminRouter.post("/faculty",async(req,res)=>{
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
adminRouter.get("/faculty",async(req,res)=>{
    try{
        let faculty=await FacultyCoordinatorModel.find().select("-password")
        res.status(200).json({
            success:true,message:"Faculty displayed",data:faculty
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to fetch faculty"
        })
    }
})
adminRouter.get("/faculty/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let faculty=await FacultyCoordinatorModel.findById(idOfReq).select("-password")
        if(!faculty){
            return res.status(404).json({
                success:false,message:"Faculty not found"
            })
        }
        res.status(200).json({
            success:true,message:"Faculty found",data:faculty
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Invalid faculty ID"
        })
    }
})
adminRouter.put("/faculty/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let faculty=await FacultyCoordinatorModel.findById(idOfReq)
        if(!faculty){
            return res.status(404).json({
                success:false,message:"Faculty not found"
            })
        }
        faculty.firstName=req.body.firstName
        faculty.lastName=req.body.lastName
        faculty.facultyID=req.body.facultyID
        faculty.department=req.body.department
        faculty.email=req.body.email
        faculty.phoneNumber=req.body.phoneNumber
        faculty.active=req.body.active
        faculty.clubs=req.body.clubs
        faculty.managedEvents=req.body.managedEvents
        await faculty.save()
        res.status(200).json({
            success:true,message:"Faculty updated",data:faculty
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to update faculty"
        })
    }
})
adminRouter.delete("/faculty/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id

        let faculty=await FacultyCoordinatorModel.findById(idOfReq)

        if(!faculty){
            return res.status(404).json({
                success:false,message:"Faculty not found"
            })
        }

        let clubs=await ClubModel.find({
            facultyCoordinator:faculty._id
        })

        if(clubs.length>0){
            return res.status(400).json({
                success:false,
                message:"Cannot delete faculty coordinator while clubs are assigned. Reassign or delete the clubs first."
            })
        }

        let events=await EventModel.find({
            facultyCoordinator:faculty._id
        })

        if(events.length>0){
            return res.status(400).json({
                success:false,
                message:"Cannot delete faculty coordinator while events are assigned. Reassign or delete the events first."
            })
        }

        await FacultyCoordinatorModel.findByIdAndDelete(idOfReq)

        res.status(200).json({
            success:true,message:"Faculty deleted successfully"
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to delete faculty"
        })
    }
})
// CLASS COORDINATOR OPERATIONS
adminRouter.post("/class-coordinators",async(req,res)=>{
    try{
        let newCoordinator=req.body
        let coordinatorDocument=await ClassCoordinatorModel.create(newCoordinator)
        res.status(201).json({
            success:true,message:"Class coordinator created",data:coordinatorDocument
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to create class coordinator"
        })
    }
})
adminRouter.get("/class-coordinators",async(req,res)=>{
    try{
        let coordinators=await ClassCoordinatorModel.find().select("-password")
        res.status(200).json({
            success:true,message:"Class coordinators displayed",data:coordinators
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to fetch class coordinators"
        })
    }
})
adminRouter.get("/class-coordinator/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let coordinator=await ClassCoordinatorModel.findById(idOfReq).select("-password")
        if(!coordinator){
            return res.status(404).json({
                success:false,message:"Class coordinator not found"
            })
        }
        res.status(200).json({
            success:true,message:"Class coordinator found",data:coordinator
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Invalid class coordinator ID"
        })
    }
})
adminRouter.put("/class-coordinator/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let coordinator=await ClassCoordinatorModel.findById(idOfReq)
        if(!coordinator){
            return res.status(404).json({
                success:false,message:"Class coordinator not found"
            })
        }
        coordinator.facultyID=req.body.facultyID
        coordinator.firstName=req.body.firstName
        coordinator.lastName=req.body.lastName
        coordinator.department=req.body.department
        coordinator.year=req.body.year
        coordinator.section=req.body.section
        coordinator.email=req.body.email
        coordinator.phoneNumber=req.body.phoneNumber
        coordinator.active=req.body.active
        await coordinator.save()
        res.status(200).json({
            success:true,message:"Class coordinator updated",data:coordinator
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to update class coordinator"
        })
    }
})
adminRouter.delete("/class-coordinator/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let deletedCoordinator=await ClassCoordinatorModel.findByIdAndDelete(idOfReq)
        if(!deletedCoordinator){
            return res.status(404).json({
                success:false,message:"Class coordinator not found"
            })
        }
        res.status(200).json({
            success:true,message:"Class coordinator deleted successfully"
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Invalid class coordinator ID"
        })
    }
})
// CLUB COORDINATOR OPERATIONS
adminRouter.post("/club-coordinators",async(req,res)=>{
    try{
        let newCoordinator=req.body
        let coordinatorDocument=await ClubCoordinatorModel.create(newCoordinator)
        res.status(201).json({
            success:true,message:"Club coordinator created",data:coordinatorDocument
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to create club coordinator"
        })
    }
})
adminRouter.get("/club-coordinators",async(req,res)=>{
    try{
        let coordinators=await ClubCoordinatorModel.find().select("-password")
        res.status(200).json({
            success:true,message:"Club coordinators displayed",data:coordinators
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to fetch club coordinators"
        })
    }
})
adminRouter.get("/club-coordinator/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let coordinator=await ClubCoordinatorModel.findById(idOfReq).select("-password")
        if(!coordinator){
            return res.status(404).json({
                success:false,message:"Club coordinator not found"
            })
        }
        res.status(200).json({
            success:true,message:"Club coordinator found",data:coordinator
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Invalid club coordinator ID"
        })
    }
})
adminRouter.put("/club-coordinator/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let coordinator=await ClubCoordinatorModel.findById(idOfReq)
        if(!coordinator){
            return res.status(404).json({
                success:false,message:"Club coordinator not found"
            })
        }
        coordinator.firstName=req.body.firstName
        coordinator.lastName=req.body.lastName
        coordinator.rollNumber=req.body.rollNumber
        coordinator.department=req.body.department
        coordinator.section=req.body.section
        coordinator.year=req.body.year
        coordinator.email=req.body.email
        coordinator.phoneNumber=req.body.phoneNumber
        coordinator.active=req.body.active
        coordinator.clubs=req.body.clubs
        coordinator.managedEvents=req.body.managedEvents
        await coordinator.save()
        res.status(200).json({
            success:true,message:"Club coordinator updated",data:coordinator
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to update club coordinator"
        })
    }
})
adminRouter.delete("/club-coordinator/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id

        let coordinator=await ClubCoordinatorModel.findById(idOfReq)

        if(!coordinator){
            return res.status(404).json({
                success:false,message:"Club coordinator not found"
            })
        }

        let clubs=await ClubModel.find({
            clubCoordinator:coordinator._id
        })

        if(clubs.length>0){
            return res.status(400).json({
                success:false,
                message:"Cannot delete coordinator while clubs are assigned. Reassign or delete the clubs first."
            })
        }

        let events=await EventModel.find({
            _id:{$in:coordinator.managedEvents}
        })

        if(events.length>0){
            return res.status(400).json({
                success:false,
                message:"Cannot delete coordinator while events are managed. Reassign or delete the events first."
            })
        }

        await ClubCoordinatorModel.findByIdAndDelete(idOfReq)

        res.status(200).json({
            success:true,message:"Club coordinator deleted successfully"
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to delete club coordinator"
        })
    }
})
// EVENT OPERATIONS
adminRouter.post("/events",async(req,res)=>{
    try{
        let newEvent=req.body
        let eventDocument=await EventModel.create(newEvent)
        res.status(201).json({
            success:true,message:"Event created",data:eventDocument
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to create event"
        })
    }
})
adminRouter.get("/events",async(req,res)=>{
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
adminRouter.get("/event/:id",async(req,res)=>{
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
            success:false,message:"Invalid id event ID"
        })
    }
})
adminRouter.put("/event/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let event=await EventModel.findById(idOfReq)
        if(!event){
            return res.status(404).json({
                success:false,message:"Event not found"
            })
        }
        event.eventName=req.body.eventName
        event.organisers=req.body.organisers
        event.department=req.body.department
        event.facultyCoordinator=req.body.facultyCoordinator
        await event.save()
        res.status(200).json({
            success:true,message:"Event updated",data:event
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to update event"
        })
    }
})
adminRouter.delete("/event/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id

        let deletedEvent=await EventModel.findById(idOfReq)

        if(!deletedEvent){
            return res.status(404).json({
                success:false,message:"Event not found"
            })
        }

        // Remove event references from students
        let students=await StudentModel.find({
            $or:[
                {registeredEvents:deletedEvent._id},
                {participatedEvents:deletedEvent._id},
                {eventsWon:deletedEvent._id}
            ]
        })

        for(let student of students){
            let updatedRegisteredEvents=[]
            for(let eventID of student.registeredEvents){
                if(eventID.toString()!==deletedEvent._id.toString()){
                    updatedRegisteredEvents.push(eventID)
                }
            }
            student.registeredEvents=updatedRegisteredEvents

            let updatedParticipatedEvents=[]
            for(let eventID of student.participatedEvents){
                if(eventID.toString()!==deletedEvent._id.toString()){
                    updatedParticipatedEvents.push(eventID)
                }
            }
            student.participatedEvents=updatedParticipatedEvents

            let updatedEventsWon=[]
            for(let eventID of student.eventsWon){
                if(eventID.toString()!==deletedEvent._id.toString()){
                    updatedEventsWon.push(eventID)
                }
            }
            student.eventsWon=updatedEventsWon

            await student.save()
        }

        // Remove event from club coordinators' managed events
        let coordinators=await ClubCoordinatorModel.find({
            managedEvents:deletedEvent._id.toString()
        })

        for(let coordinator of coordinators){
            let updatedManagedEvents=[]
            for(let eventID of coordinator.managedEvents){
                if(eventID.toString()!==deletedEvent._id.toString()){
                    updatedManagedEvents.push(eventID)
                }
            }
            coordinator.managedEvents=updatedManagedEvents
            await coordinator.save()
        }

        await EventModel.findByIdAndDelete(idOfReq)

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

adminRouter.get("/students/:department",async(req,res)=>{
    try{
        let departmentName=req.params.department
        let students=await StudentModel.find({department:departmentName}).select("-password")
        res.status(200).json({
            success:true,message:"Department students displayed",data:students
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to fetch students"
        })
    }
})
adminRouter.get("/department/events/:department",async(req,res)=>{
    try{
        let departmentName=req.params.department
        let events=await EventModel.find({department:departmentName})
        res.status(200).json({
            success:true,message:"Department events displayed",data:events
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to fetch events"
        })
    }
})
adminRouter.put("/student/:id/activate",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let student=await StudentModel.findById(idOfReq)
        if(!student){
            return res.status(404).json({
                success:false,message:"Student not found"
            })
        }
        student.active=true
        await student.save()
        res.status(200).json({
            success:true,message:"Student activated successfully"
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Invalid student ID"
        })
    }
})
adminRouter.put("/student/:id/deactivate",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let student=await StudentModel.findById(idOfReq)
        if(!student){
            return res.status(404).json({
                success:false,message:"Student not found"
            })
        }
        student.active=false
        await student.save()
        res.status(200).json({
            success:true,message:"Student deactivated successfully"
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Invalid student ID"
        })
    }
})
adminRouter.get("/event/:eventid/students",async(req,res)=>{
    try{
        let eventID=req.params.eventid
        let event=await EventModel.findById(eventID)
        if(!event){
            return res.status(404).json({
                success:false,message:"Event not found"
            })
        }
        let students=await StudentModel.find({_id:{$in:event.registeredStudents}}).select("-password")
        res.status(200).json({
            success:true,message:"Registered students displayed successfully",data:students
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Invalid event ID"
        })
    }
})