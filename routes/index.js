var express = require('express');
var router = express.Router();
var dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config();
const dbUrl = process.env.DBURL;

// Welcome Page
router.get('/', async(req, res)=>{
  try{
    res.status(200).send("Welcome to Mentor-Student Management Portal")
  }
  catch(err){
    res.status(400).send(err)
  }
});


// To create a Student with or without Mentor
router.post("/CreateStudent",async(req,res)=>{
  const client = await MongoClient.connect(dbUrl)
  const Id_Creator = Math.random()*10000
  const Id_No = Math.ceil(Id_Creator)+""
  try{
    if(req.body.Name && req.body.Mobile && req.body.Email && req.body.Course){
      const db = client.db("MentorStudent");
      const data = await db.collection("Students").find().project({_id:0}).toArray()
      const Roll_No = Id_No;
      const Name = req.body.Name;
      const Mobile = req.body.Mobile;
      const Email = req.body.Email;
      const Course = req.body.Course;
      let Mentor;
      if(req.body.Mentor){
        Mentor =req.body.Mentor;
      }else{
        Mentor=""
      }
      const Find_Mobile = data.find((mob)=>mob.Mobile==Mobile)
      const Find_Mail = data.find((mail)=>mail.Email==Email)
      if(Find_Mobile==undefined && Find_Mail==undefined){
        const Student = await db.collection("Students").insertOne({
          "Roll_No":Roll_No,
          "Name" : Name,
          "Mobile":Mobile,
          "Email":Email,
          "Course":Course,
          "Mentor":Mentor
        })
        res.status(200).send("Student Created Successfully")
      }
      else{
        res.status(400).send("Student with same mobile number or email already exists")
      }
    }
    else{
      res.status(400).send({"Error Message":"Try to create a student with following details","Name":"required","Mobile":"required","Email":"required","Course":"required","Mentor":"optional"})
    }
  }
  catch(err){
    res.status(400).send(err)
  }
  finally{
    client.close()
  }
})


// To create a Mentor
router.post("/CreateMentor",async(req,res)=>{
  const client = await MongoClient.connect(dbUrl)
  const Id_Creator = Math.random()*10000
  const Id_No = Math.ceil(Id_Creator)+""
  try{
    if(req.body.Name && req.body.Mobile && req.body.Email && req.body.Role && req.body.Tech_Skills){
      const db = client.db("MentorStudent");
      const data = await db.collection("Mentors").find().project({_id:0}).toArray()
      const Mentor_No = Id_No;
      const Name = req.body.Name;
      const Mobile = req.body.Mobile;
      const Email = req.body.Email;
      const Role= req.body.Role;
      const Tech_Skills = req.body.Tech_Skills
      const Find_Mobile = data.find((mob)=>mob.Mobile==Mobile)
      const Find_Mail = data.find((mail)=>mail.Email==Email)
      if(Find_Mobile==undefined && Find_Mail==undefined){
        const Mentor = await db.collection("Mentors").insertOne({
          "Mentor_No":Id_No,
          "Name" : Name,
          "Mobile":Mobile,
          "Email":Email,
          "Role":Role,
          "Tech_Skills":Tech_Skills
        })
        res.status(200).send("Mentor Created Successfully")
      }
      else{
        res.status(400).send("Mentor with same mobile number or email already exists")
      }
    }
    else{
      res.status(400).send({"Error Message":"Try to create a Mentor with following details","Name":"required","Mobile":"required","Email":"required","Role":"required","Tech_Skills":"required"})
    }
  }
  catch(err){
    res.status(400).send(err)
  }
  finally{
    client.close()
  }
})

// To get all Student Details
router.get("/students",async(req,res)=>{
  const client = await MongoClient.connect(dbUrl)
  try{
    const db = client.db("MentorStudent");
    const data = await db.collection("Students").find().project({_id:0}).toArray()
    res.status(200).send(data)
  }
  catch(err){
    res.status(400).send(err)
  }
  finally{
    client.close()
  }
})


// To get all Mentor Details
router.get("/mentors",async(req,res)=>{
  const client = await MongoClient.connect(dbUrl)
  try{
    const db = client.db("MentorStudent");
    const data = await db.collection("Mentors").find().project({_id:0}).toArray()
    res.status(200).send(data)
  }
  catch(err){
    res.status(400).send(err)
  }
  finally{
    client.close()
  }
})


// To show all students for a particular mentor
router.get("/mentees/:id",async(req,res)=>{
  const client = await MongoClient.connect(dbUrl)
  try{
      const {id} = req.params;
      const db = client.db("MentorStudent");
      const data = await db.collection("Students").find({"Mentor": id}).project({_id:0}).toArray()
      if(data.length>0){
        res.status(200).send(data)
      }else{
        res.status(400).json({"Error":"Mentor not available or Mentor has no students assigned with"})
      }
  }
  catch(err){
    res.status(400).send(err)
  }
  finally{
    client.close()
  }
})

// To get available mentors and students without mentors
router.get("/AssignMentees",async(req,res)=>{
  const client = await MongoClient.connect(dbUrl)
  try{
    const db = client.db("MentorStudent");
    const Stud_data = await db.collection("Students").find({"Mentor": ""}).project({_id:0}).toArray()
    const Men_data = await db.collection("Mentors").find().project({_id:0,Name:1}).toArray()
    if(Stud_data.length>0){
      const data = [{"Mentors Availabele":Men_data},{"Students without mentors":Stud_data}]
      res.status(200).send(data)
    }
    else{
      res.status(400).json({"Error":"All students are assigned with mentors"})
    }
  }
  catch(err){
    res.status(400).send(err)
  }
  finally{
    client.close()
  }
})


// To assign student to a mentor
router.put("/AssignMentees/:id",async(req,res)=>{
  const client = await MongoClient.connect(dbUrl)
  try{
    const {id} = req.params;
    const db = client.db("MentorStudent");
    const Stud_data = await db.collection("Students").find({"Mentor": ""}).project({_id:0}).toArray()
    const Men_data = await db.collection("Mentors").find({"Name":id}).project({_id:0}).toArray()
    const Mentees = req.body.Mentees;
    if(Stud_data.length>0 && Men_data.length>0){
      if(Array.isArray(req.body.Mentees)){
        const updated_data =[];
        for(let stud of Mentees){
          const find_Mentee = Stud_data.find((data)=>data.Roll_No==stud)
          if(find_Mentee!=undefined){
            const Data = await db.collection("Students").updateOne({"Roll_No":stud},{$set:{"Mentor":id}})
            updated_data.push(Data)
          }
        }
        if(updated_data.length==0){
          res.status(400).send({"Message":"No data is updated",
            "Detail":"Student already has mentor or Student not available"}
          )
        }
        else{
          res.status(200).send("Mentor Assigning Successful")
        }
      }
      else{
        res.status(400).json({"Error":"Try to send req.body.Roll_No as Array",
          "req.body.Mentees":[""]
        })
      }
    }
    else{
      res.status(400).json({"Error":"Mentor not available or all students are assigned with mentors"})
    }
  }
  catch(err){
    res.status(400).send(err)
  }
  finally{
    client.close()
  }
})


// To change a mentor for particular student
router.put("/ChangeMentor/:id",async(req,res)=>{
  const client = await MongoClient.connect(dbUrl)
  try{
    if(req.params && req.body.Mentor){
      const {id} = req.params;
      const db = client.db("MentorStudent");
      const Stud_data = await db.collection("Students").find({"Roll_No":id}).project({_id:0}).toArray()
      if(Stud_data.length==1){
        const Mentor = req.body.Mentor
        const Men_data = await db.collection("Mentors").find({"Name":Mentor}).project({_id:0}).toArray()
        if(Men_data.length==1){
          const prev_Mentor = Stud_data[0].Mentor;
          const data = await db.collection("Students").updateOne({"Roll_No":id},{$set:{"Mentor":Mentor,"Old_Mentor":prev_Mentor}})
          res.status(200).send("Mentor changed successfully")
        }
        else{
          res.status(400).send({"Message":"Mentor with the given name not available"})
        }
      }
      else{
        res.status(400).send({"Message":"The Student you are looking for is not available"})
      }
    }
    else{
      res.status(400).send("Try to give students Roll_No in req.params and Mentor in req.body")
    }
  }
  catch(err){
    res.status(400).send(err)
  }
  finally{
    client.close()
  }
})


// To show the previously assigned mentor for a particular student
router.get("/PreviousMentor/:id",async(req,res)=>{
  const client = await MongoClient.connect(dbUrl)
  try{
    if(req.params){
      const {id} = req.params;
      const db = client.db("MentorStudent");
      const Stud_data = await db.collection("Students").findOne({"Roll_No":id},{projection:{_id:0}})
      if(Stud_data){
        if(Stud_data.Old_Mentor){
          const Men_data = await db.collection("Mentors").findOne({"Name":Stud_data.Old_Mentor},{projection:{_id:0}})
          res.status(200).send({"Student_Data":Stud_data,"Old_Mentor_Data":Men_data})
        }
        else{
          res.status(400).send("The previous mentor is not available because the mentor is not yet changed for this student")
        }
      }
      else{
        res.status(400).send({"Message":"The Student you are looking for is not available"})
      }
    }
    else{
      res.status(400).send("Try to give students Roll_No in req.params")
    }
  }
  catch(err){
    res.status(400).send(err)
  }
  finally{
    client.close()
  }
})


//delete student
router.delete("/DeleteStudent/:id",async(req,res)=>{
  const client = await MongoClient.connect(dbUrl)
  try{
    if(req.params){
      const {id} = req.params;
      const db = client.db("MentorStudent");
      const data = await db.collection("Students").find().toArray()
      const find_Stud = data.find((Roll)=>Roll.Roll_No==id)
      if(find_Stud){
        const Stud = await db.collection("Students").deleteOne({"Roll_No":id})
        res.status(200).send("Student Data deleted successfully")
      }
      else{
        res.status(400).send("Student with the given Roll_No does not exists")
      }
    }
    else{
      res.status(400).send({"Error Message": "Give student's Roll_No in req.params to delete a student"})
    }
  }
  catch(err){
    res.status(400).send(err)
  }
  finally{
    client.close()
  }
})


//delete mentor
router.delete("/DeleteMentor/:id",async(req,res)=>{
  const client = await MongoClient.connect(dbUrl)
  try{
    if(req.params){
      const {id} = req.params;
      const db = client.db("MentorStudent");
      const data = await db.collection("Mentors").find().toArray()
      const find_Men = data.find((Roll)=>Roll.Mentor_No==id)
      if(find_Men){
        const Mentor = await db.collection("Mentors").deleteOne({"Mentor_No":id})
        res.status(200).send("Mentor Data deleted successfully")
      }
      else{
        res.status(400).send("Mentor with the given Mentor_No does not exists")
      }
    }
    else{
      res.status(400).send({"Error Message": "Give Mentor_No in req.params to delete a Mentor"})
    }
  }
  catch(err){
    res.status(400).send(err)
  }
  finally{
    client.close()
  }
})


module.exports = router;
