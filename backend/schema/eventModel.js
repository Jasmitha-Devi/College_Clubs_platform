import {Schema,model} from 'mongoose'
const eventSchema=new Schema({
    eventName:{
        type:String,
        required:[true,"Event name is mandatory"],
        trim:true
    },
    organisers:{
        type:[String],
        required:[true,"Organisers are mandatory"]
    },
    department:{
        type:String,
        required:[true,"Department is mandatory"],
        trim:true
    },
    registeredStudents:{
        type:[Schema.Types.ObjectId],
        ref:"student",
        default:[]
    },
    facultyCoordinator:{
        type:Schema.Types.ObjectId,
        ref:"facultyCoordinator",
        required:[true,"Faclty coordinator is mandatory"]
    }
},{timestamps:true})
export const EventModel=model("event",eventSchema)