// Importing Dependencies
import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();
const DbUrl = process.env.DBURL

// Connecting to database
const DBconnect = async()=>{
    try{
        if(!DbUrl){
            throw new Error("Mongodb connection is not set in environmental variable")
        }
        await mongoose.connect(DbUrl);
        console.log("Connected to Database")
    }
    catch(err){
        console.log("Mongodb connection failed", err)
    }
}
 
export default DBconnect;