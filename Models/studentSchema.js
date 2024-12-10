// Importing necessary Components
import mongoose from "mongoose";
import validator from "validator";

// Validation Schema
const studentSchema = new mongoose.Schema({
    Roll_No: {
        type : String,
        unique : true
    },
    Name : {
        type : String,
        required : true
    },
    Email : {
        type : String,
        required : true ,
        lowercase : true,
        validate : (value) =>{
            return validator.isEmail(value);
        }
    },
    Mobile :{
        type : String,
        required : true,
        unique : true
    },
    Course : {
        type : String,
        required : true
    },
    Mentor :{
        type : String,
    },
    Old_Mentor :{
        type : String,
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
},{
    versionKey : false
})

const students = mongoose.model("students",studentSchema);
export default students;