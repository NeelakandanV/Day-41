import mentors from "../Models/mentorSchema.js";
import students from "../Models/studentSchema.js";

// To create a Mentor
export const createMentor = async(req,res)=>{
  const Id_Creator = Math.random()*10000
  const Id_No = Math.ceil(Id_Creator)+""
  try{
    const find_User = await mentors.find({Email:req.body.Email})
    if(!find_User){
      req.body.Mentor_No = Id_No;
      req.body.Tech_Skills = req.body.Tech_Skills || [""];
      const UserData = await mentors.create(req.body);
      await UserData.save();
      res.status(200).send({message:"Mentor created!"})
    }
    else{
      res.status(400).send({message:"Mentor email already exists!"})
    }
  }
  catch(err){
    res.status(500).send({message:"Internal Server Error",err})
  }
}


  // To get all Mentor Details
export const allMentors = async(req,res)=>{
  try{
    const find_Students = await mentors.find().pretty.toArray()
    if(find_Students.length>0)
      res.status(200).send({message:"Mentors data fetched",MentorData:find_Students})
    else{
      res.status(400).send({message:"Data not found"})
    }
  }
  catch(err){
    res.status(500).send({message:"Internal Server Error",err})
  }
}

// To show all students for a particular mentor
export const getMentees = async(req,res)=>{
  try{
      const {id} = req.params;
      const data = await students.find({"Mentor": id}).project({_id:0}).toArray()
      if(data.length>0){
        res.status(200).send({message:"Data fetched",Mentees:data})
      }else{
        res.status(400).send({message:"Mentor not available or Mentor has no students assigned with"})
      }
  }
  catch(err){
    res.status(500).send({message:"Internal Server Error",err})
  }
}

//delete mentor
export const deleteMentor = async(req,res)=>{
  try{
      const {id} = req.params;
      const find_Men = await mentors.find({Mentor_No:id})
      if(find_Men){
        const Mentor = await mentors.deleteOne({Mentor_No:id})
        res.status(200).send({message:"Mentor Data deleted successfully"})
      }
      else{
        res.status(400).send({message:"Mentor with the given Mentor_No does not exists"})
      }
  }
  catch(err){
   res.status(500).send({message:"Internal Server Error",err})
  }
}
