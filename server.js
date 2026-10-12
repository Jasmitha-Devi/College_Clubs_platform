import exp from 'express'
import {connect} from 'mongoose'
import { studentRouter } from './APIs/studentAPI.js'
import {hodRouter} from './APIs/hodAPI.js'
import {adminRouter} from './APIs/adminAPI.js'
import {clubCoordinatorRouter} from './APIs/clubCoordinatorAPI.js'
import {classCoordinatorRouter} from './APIs/classCoordinatorAPI.js'
import {eventRouter} from './APIs/eventAPI.js'
import { facultyRouter } from './APIs/facultyAPI.js'
const app=exp()
app.use(exp.json())
app.use("/student-api",studentRouter)
app.use("/hod-api",hodRouter)
app.use("/admin-api",adminRouter)
app.use("/club-coordinator-api",clubCoordinatorRouter)
app.use("/class-coordinator-api",classCoordinatorRouter)
app.use("/event-api",eventRouter)
app.use("/faculty-api", facultyRouter)
async function connectToDB(){
    try{
    await connect('mongodb://localhost:27017/college_clubs_platformdb')
    console.log("Connected")
    app.listen(4000,()=>console.log("LSitening"))
    }
    catch(err){
        console.log("ERR",err)
    }
}
connectToDB()