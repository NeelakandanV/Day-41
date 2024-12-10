// Importing necessary components
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import admins from "../Models/adminSchema.js"
import { hashCompare, hashPassword, LoginToken, ResetToken } from "../Utils/Auth.js";
import nodemailer from "nodemailer";

dotenv.config();


// Creating User - Signup - Post
export const CreateUser = async(req,res)=>{
    try{
        const find_User = await admins.find({Email:req.body.Email})
        if(!find_User){
            let hashedPassword = await hashPassword(req.body.Password);
            req.body.Password = hashedPassword;
            const UserData = await admins.create(req.body);
            await UserData.save();
            res.status(200).send({message:"Signup Successful!"})
        }
        else{
            res.status(400).send({message:"User already exists!"})
        }
    }
    catch(err){
        res.status(500).send({message:"Internal Server Error",err})
    }
}


// Checking User Credentials - Login - Post
export const LoginUser = async(req,res)=>{
    try{
        const find_User = await admins.find({Email:req.body.Email})
        if(find_User){
            if(req.body.Password){
                const Password_Status = await hashCompare(req.body.Password,find_User.Password)
                if(Password_Status){
                    let token = await LoginToken({
                        Email:find_User.Email,
                        Role : find_User.Role,
                        Status: find_User.Status,
                        Id : find_User._id
                    })

                    // set a cookie with the token
                    res.cookie('token', token, {
                        httpOnly :true,
                        sameSite : 'none',
                        secure :  true
                    });
                    res.status(200).send({message:"Login Successful",token,user:find_User})
                }
                else{
                    res.status(401).send({message:"Incorrect Password!"})
                }
            }
            else{
                res.status(400).send({message:"Password required"})
            }
        }
        else{
            res.status(400).send({message:"User not registered yet!"})
        }
    }
    catch(err){
        res.status(500).send({message:"Internal server error",err})
    }
}

// Forgot Password Link - ForgotPassword - put

export const ForgotPassword = async(req,res)=>{
    try{
        const find_User = await admins.findOne({Email: req.body.Email})
        if(!find_User){
            res.status(400).send({message:"User not found"})
        }
        else{
            // Generating a random string
            const String = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            const ResetStringLength = 6;  //string length we want
            const StringLength = String.length;
            let ResetString ="";
            for(let i=0;i<ResetStringLength;i++){
                ResetString = ResetString + String.charAt(Math.floor(Math.random()*StringLength))
            }
            //Updating Reset String in Db
            const UpdateResetString = await admins.updateOne({Email :req.body.Email},{$set:{ResetPin : ResetString}})
            // Generating reset link
            let token = await ResetToken({
                Name : find_User.First_Name,
                Email : find_User.Email
            })
            const link = `https://mentor-student-vulz.onrender.com/ResetPassword/${find_User._id}/${ResetString}/${token}`
            // for Sending mails - nodemailer
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'hari1507hari@gmail.com',
                  pass: process.env.MAILPASS
                }
              });
              
              var mailOptions = {
                from: 'hari1507hari@gmail.com',
                to: find_User.Email,
                subject: 'Reset your Edutech Account Password',
                html:`<p>Kindly click the below link or copy and paste the link in your browser to reset your password.<b>Your Link is valid for only 5 minutes</b></p><a href=${link}>Click here to reset Password</a></br><p></p>copy and paste the link in your browser<p>${link}</p><br/><p>With love💙 Edutech Team</p>`
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  res.status(400).send(error)
                } else {
                    res.status(200).send({message : `Reset Link sent to ${find_User.Email}`, "Mail" : info.response})
                }
            });
        }
    }
    catch(err){
        res.status(500).send({message : "Internal server error",err})
    }
}


// Reset Password - ResetPassword - Put
export const PasswordReset =async(req,res)=>{
    try{
        const {id,pin,token} = req.params;
        // Validating the reset link
        const find_User = await admins.findOne({_id: id})
        if(pin===find_User.ResetPin){
            const verifyToken = await jwt.verify(token,process.env.SECRETKEY_RESET)
            if(Math.floor((+new Date())/1000) < verifyToken.exp){
                // Updating New Password
                let hashedPassword = await hashPassword(req.body.Password)
                req.body.Password = hashedPassword;
                const updateNewPassword = await admins.updateOne({_id:id},{$set:{Password:req.body.Password}});
                const deleteResetPin = await admins.updateOne({_id:id},{$unset:{ResetPin:""}})
                res.status(200).send({message:"New Password Created Successfully!"})
            }
            else{
                res.status(401).send({message:"Token expired or Token not found"})
            }
        }
        else{
            res.status(401).send({Error:"Unauthorized",message: "Token Expired or Token not found"})
        }
    }
    catch(err){
        res.status(500).send({message:"Internal Server Error",data :"Send Password in req.body",err})
    }
}

// Link to Verify User - for users - PUT
export const VerifyUserLink = async(req,res)=>{
    try{
        const find_User = await admins.findOne({Email: req.body.Email})
        if(!find_User){
            res.status(400).send({message:"User not found,Kindly Signup first"})
        }
        else{
            if(find_User.Status=="Verified"){
                res.status(400).send({message:"User Account already Verified"})
            }
            else{
                // Generating a random string
                const String = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
                const ResetStringLength = 6;  //string length we want
                const StringLength = String.length;
                let ResetString ="";
                for(let i=0;i<ResetStringLength;i++){
                    ResetString = ResetString + String.charAt(Math.floor(Math.random()*StringLength))
                }
    
                //Updating Reset String in Db
                const UpdateResetString = await admins.updateOne({Email :req.body.Email},{$set:{VerifyPin : ResetString}})
    
                // Generating reset link
                let token = await ResetToken({
                    Name : find_User.First_Name,
                    Email : find_User.Email
                })
                const link = `https://mentor-student-vulz.onrender.com/Verification/${find_User._id}/${ResetString}/${token}`
    
                // for Sending mails - nodemailer
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'hari1507hari@gmail.com',
                      pass: process.env.MAILPASS
                    }
                  });
                  
                  var mailOptions = {
                    from: 'hari1507hari@gmail.com',
                    to: find_User.Email,
                    subject: 'Verify Your Edutech Account ',
                    html:`<p>Kindly click the below link or copy and paste the link in your browser to verify your Edutech Account.<b>Your Link is valid for only 5 minutes</b></p><a href=${link}>Click here to verify account</a></br><p></p>copy and paste the link in your browser<p>${link}</p><br/><p>With love💙 Edutech Team</p>`
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      res.status(400).send(error)
                    } else {
                        res.status(200).send({message : `Verification Link sent to ${find_User.Email}`, "Mail" : info.response})
                    }
                });
            }
        }
    }
    catch(err){
        res.status(500).send({message : "Internal server error",err})
    }
}

// Verify User - for Users - GET
export const verifyUser =async(req,res)=>{
    try{
        const {id,pin,token} = req.params;
        // Validating the reset link
        const find_User = await admins.findOne({_id: id})
        if(pin===find_User.VerifyPin){
            const verifyToken = await jwt.verify(token,process.env.SECRETKEY_RESET)
            if(Math.floor((+new Date())/1000) < verifyToken.exp){
                // Updating New Password
                const changeStatus = await admins.updateOne({_id:id},{$set:{Status:"Verified"}})
                const deleteResetPin = await admins.updateOne({_id:id},{$unset:{VerifyPin:""}})
                res.status(200).send({message:"User Verified Successfully!"})
            }
            else{
                res.status(401).send({message:"Token expired or Token not found"})
            }
        }
        else{
            res.status(401).send({Error:"Unauthorized",message: "Token Expired or Token not found"})
        }
    }
    catch(err){
        res.status(500).send({message:"Internal Server Error",data :"Invalid Link",err})
    }
}


// Logout User - GET
export const Logout = async(req,res)=>{
    const token = req.cookies.token || req.headers.authorization.split(" ")[1]
    const data = await jwt.decode(token)
    try{
        if(!data.Id){
            res.status(400).send({message:"User not logged in"})
        }else{
            res.clearCookie('token')
            res.status(200).send({message:"Logout Successful"})
        }
    }
    catch(err){
        res.status(500).send({message:"Internal Server Error",err})
    }
}