import exp from 'express'
import {StudentModel} from '../backend/schema/studentModel.js' 
import { EventModel } from '../backend/schema/eventModel.js'
export const studentRouter=exp.Router()
studentRouter.post("/students",async (req,res)=>{
    let newstudent=req.body
    let studentDocument= await StudentModel.create(newstudent)
    res.status(201).json({
        success:true,message:"Student created","data":studentDocument
    })
})
studentRouter.get("/student/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let student=await StudentModel.findById(idOfReq).select("-password")
        if(!student){
            return res.status(404).json({
                success:false,message:"Student not found"
            })
        }
        res.status(200).json({
            success:true,message:"Student found","data":student
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Invalid ID"
        })
    }
})
studentRouter.get("/events",async(req,res)=>{
    try{
        let events=await EventModel.find()
        res.status(200).json({
            success:true,message:"Events dispalyed ",data:events
        })
    }
    catch(err){
        res.status(500).json({
            success:false,message:"Failed"
        })
    }
})
studentRouter.delete("/student/:id",async(req,res)=>{
    try{
        let idOfReq=req.params.id
        let deletedStudent=await StudentModel.findByIdAndDelete(idOfReq)
        if(!deletedStudent){
           return res.status(404).json({
               success:false,message:"Student not found"
           })
        }
        res.status(200).json({
            success:true,message:"Student deleted successfully"
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Invalid student Id"
        })
    }
})
studentRouter.post("/events/:eventid/register/:studentid",async(req,res)=>{
    try{
        let eventID=req.params.eventid
        let studentID=req.params.studentid
        let event=await EventModel.findById(eventID)
        let student=await StudentModel.findById(studentID)
        if (!student) {
            return res.status(404).json({
            success: false,message: "Student not found"
        })
}
        if(!event){
            return res.status(404).json({
               success:false,message:"Event not found"
           })
        }
        event.registeredStudents.push(studentID)
        await event.save()
        res.status(200).json({
            success:true,message:"Student registered successfully"
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Registration failed"
        })
    }
})
studentRouter.delete("/events/:eventid/register/:studentid",async(req,res)=>{
    try{
        let eventID=req.params.eventid
        let studentID=req.params.studentid
        let event=await EventModel.findById(eventID)
        if(!event){
            return res.status(404).json({
               success:false,message:"Event not found"
           })
        }
        event.registeredStudents=event.registeredStudents.filter((arg)=>arg.toString()!==studentID)
        await event.save()
        res.status(200).json({
            success:true,message:"Student unregistered successfully"
        })
    }
    catch(err){
        res.status(400).json({
            success:false,message:"Unregistration failed"
        })
    }
})