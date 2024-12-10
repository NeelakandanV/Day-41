// Importing necessary Components
import mongoose from "mongoose";
import validator from "validator";

// Validation Schema
const mentorSchema = new mongoose.Schema({
    Mentor_No: {
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
        required : true
    },
    Role : {
        type : String,
        required : true
    },
    Tech_Skills :[{
        type : String,
    }],
    createdAt : {
        type : Date,
        default : Date.now
    },
},{
    versionKey : false
})

const mentors = mongoose.model("mentors",mentorSchema);
export default mentors;