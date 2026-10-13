import exp from 'express'
import {EventModel} from '../schema/eventModel.js'
import {StudentModel} from '../schema/studentModel.js'
export const eventRouter=exp.Router()
eventRouter.post("/",async(req,res)=>{
    try{
        let newEvent=req.body
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
eventRouter.get("/",async(req,res)=>{
    try{
        let events=await EventModel.find()
        res.status(200).json({
            success:true,message:"Events displayed",data:events
        })
    }
    catch(err){
        res.status(500).json({
            success:false,message:"Failed to fetch events"
        })
    }
})
eventRouter.get("/:id",async(req,res)=>{
    try{
        let event=await EventModel.findById(req.params.id)
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
        let event=await EventModel.findById(req.params.id)
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
        let deletedEvent=await EventModel.findByIdAndDelete(req.params.id)
        if(!deletedEvent){
            return res.status(404).json({
                success:false,message:"Event not found"
            })
        }
        res.status(200).json({
            success:true,message:"Event deleted successfully",data:deletedEvent
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Failed to delete event"
        })
    }
})
eventRouter.get("/department/:department",async(req,res)=>{
    try{
        let events=await EventModel.find({
            department:req.params.department
        })
        res.status(200).json({
            success:true,message:"Department events displayed",data:events
        })
    }
    catch(err){
        res.status(500).json({
            success:false,message:"Failed to fetch department events"
        })
    }
})
eventRouter.get("/:id/students",async(req,res)=>{
    try{
        let event=await EventModel.findById(req.params.id)
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
eventRouter.post("/:id/register/:studentid",async(req,res)=>{
    try{
        let event=await EventModel.findById(req.params.id)
        if(!event){
            return res.status(404).json({
                success:false,message:"Event not found"
            })
        }
        let student=await StudentModel.findById(req.params.studentid)
        if(!student){
            return res.status(404).json({
                success:false,message:"Student not found"
            })
        }
        if(event.registeredStudents.includes(student._id)){
            return res.status(400).json({
                success:false,message:"Student is already registered"
            })
        }
        event.registeredStudents.push(student._id)
        await event.save()
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
        let event=await EventModel.findById(req.params.id)
        if(!event){
            return res.status(404).json({
                success:false,message:"Event not found"
            })
        }
        let student=await StudentModel.findById(req.params.studentid)
        if(!student){
            return res.status(404).json({
                success:false,message:"Student not found"
            })
        }
        event.registeredStudents=event.registeredStudents.filter(
            (id)=>id.toString()!==student._id.toString()
        )
        await event.save()
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
eventRouter.get("/faculty/:facultyid",async(req,res)=>{
    try{
        let events=await EventModel.find({
            facultyCoordinator:req.params.facultyid
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