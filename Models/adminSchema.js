// Importing necessary Components
import mongoose from "mongoose";
import validator from "validator";

// Validation Schema
const adminSchema = new mongoose.Schema({
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
    Password : {
        type : String,
        required : true
    },
    Role : {
        type : String,
        default : "Admin"
    },
    Status :{
        type : String,
        default : "Not Verified"
    },
    VerifyPin : {
        type : String
    },
    ResetPin : {
        type : String
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
},{
    versionKey : false
})

const admins = mongoose.model("admins",adminSchema);
export default admins;