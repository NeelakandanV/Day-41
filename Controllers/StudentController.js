import express from "express";
import students from "../Models/studentSchema.js";
import mentors from "../Models/mentorSchema.js";

// Welcome Page
export const welcomePage = async(req, res)=>{
  try{
    res.status(200).send("Welcome to Mentor-Student Management Portal")
  }
  catch(err){
    res.status(500).send({message:"Internal Server Error",err})
  }
};

// To create a Student with or without Mentor
export const createStudent = async(req,res)=>{
  const Id_Creator = Math.random()*10000
  const Id_No = Math.ceil(Id_Creator)+""
  try{
    const find_User = await students.find({Email:req.body.Email})
    if(!find_User){
      req.body.Roll_No = Id_No;
      req.body.Mentor = req.body.Mentor || "";
      const UserData = await students.create(req.body);
      await UserData.save();
      res.status(200).send({message:"Student created!"})
    }
    else{
      res.status(400).send({message:"Student with same email already exists!"})
    }
  }
  catch(err){
    res.status(500).send({message:"Internal Server Error",err})
  }
}

// To get all Student Details
export const getAllStudents = async(req,res)=>{
  try{
    const find_Students = await students.find().pretty.toArray()
    if(find_Students.length>0)
      res.status(200).send({message:"Students data fetched",students:find_Students})
    else{
      res.status(400).send({message:"Data not found"})
    }
  }
  catch(err){
    res.status(500).send({message:"Internal Server Error",err})
  }
}

// To get available mentors and students without mentors
export const assignMentees = async(req,res)=>{
  try{
    const Stud_data = await students.find({"Mentor": ""}).project({_id:0}).toArray()
    const Men_data = await mentors.find().project({_id:0,Name:1}).toArray()
    if(Stud_data.length>0){
      const data = [{"Mentors Availabele":Men_data},{"Students without mentors":Stud_data}]
      res.status(200).send({message:"Data Fetched",data})
    }
    else{
      res.status(400).send({message:"All students are assigned with mentors"})
    }
  }
  catch(err){
    res.status(500).send({message:"Internal Server Error",err})
  }
}


// To assign student to a mentor
export const assignToMentor = async(req,res)=>{
  try{
    const {id} = req.params;
    const Stud_data = await students.find({"Mentor": ""}).project({_id:0}).toArray()
    const Men_data = await mentors.find({"Name":id}).project({_id:0}).toArray()
    const Mentees = req.body.Mentees;
    if(Stud_data.length>0 && Men_data.length>0){
      if(Array.isArray(req.body.Mentees)){
        const updated_data =[];
        for(let stud of Mentees){
          const find_Mentee = Stud_data.find((data)=>data.Roll_No==stud)
          if(find_Mentee!=undefined){
            const Data = await students.updateOne({"Roll_No":stud},{$set:{"Mentor":id}})
            updated_data.push(Data)
          }
        }
        if(updated_data.length==0){
          res.status(400).send({message:"No data is updated",
            "Detail":"Student already has mentor or Student not available"}
          )
        }
        else{
          res.status(200).send({message:"Mentor Assigning Success"})
        }
      }
      else{
        res.status(400).send({message:"Try to send req.body.Roll_No as Array",
          "req.body.Mentees":[""]
        })
      }
    }
    else{
      res.status(400).send({message:"Mentor not available or all students are assigned with mentors"})
    }
  }
  catch(err){
    res.status(400).send({message:"Internal Server Error",err})
  }
}


// To change a mentor for particular student
export const changeMentor = async(req,res)=>{
  try{
      const {id} = req.params;
      const Stud_data = await students.findOne({"Roll_No":id}).project({_id:0})
      if(Stud_data.length==1){
        const Mentor = req.body.Mentor
        const Men_data = await mentors.find({"Name":Mentor}).project({_id:0})
        if(Men_data.length==1){
          const prev_Mentor = Stud_data.Mentor;
          const data = await students.updateOne({"Roll_No":id},{$set:{"Mentor":Mentor,"Old_Mentor":prev_Mentor}})
          res.status(200).send({message:"Mentor changed successfully"})
        }
        else{
          res.status(400).send({message:"Mentor with the given name not available"})
        }
      }
      else{
        res.status(400).send({message:"The Student you are looking for is not available"})
      }
  }
  catch(err){
    res.status(500).send({message:"Internal Server Error",err})
  }
}


// To show the previously assigned mentor for a particular student
export const showPrevMentor = async(req,res)=>{
  try{
      const {id} = req.params;
      const Stud_data = await students.findOne({"Roll_No":id})
      if(Stud_data){
        if(Stud_data.Old_Mentor){
          const Men_data = await mentors.findOne({"Name":Stud_data.Old_Mentor},{projection:{_id:0}})
          res.status(200).send({message:"Data Fetched","Student_Data":Stud_data,"Old_Mentor_Data":Men_data})
        }
        else{
          res.status(400).send({message:"The previous mentor is not available because the mentor is not yet changed for this student"})
        }
      }
      else{
        res.status(400).send({message:"The Student you are looking for is not available"})
      }
  }
  catch(err){
    res.status(500).send({message:"Internal Server Error",err})
  }
}


//delete student
export const deleteStudent = async(req,res)=>{
  const client = await MongoClient.connect(dbUrl)
  try{
      const {id} = req.params;
      const find_Stud = await students.find({Roll_No:id})
      if(find_Stud){
        const Stud = await students.deleteOne({Roll_No:id})
        res.status(200).send({message:"Student Data deleted successfully"})
      }
      else{
        res.status(400).send({message:"Student with the given Roll_No does not exists"})
      }
  }
  catch(err){
    res.status(500).send({message:"Internal Server Error",err})
  }
}