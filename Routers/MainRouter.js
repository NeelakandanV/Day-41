// Importing necessary components
import express from "express";
import { isVerifiedAdmin, Validate } from "../Utils/Auth.js";
import { assignMentees, assignToMentor, changeMentor, createStudent, deleteStudent, getAllStudents, showPrevMentor, welcomePage } from "../Controllers/StudentController.js";
import { CreateUser, ForgotPassword, LoginUser, Logout, PasswordReset, verifyUser, VerifyUserLink } from "../Controllers/AuthController.js";
import { allMentors, createMentor, deleteMentor, getMentees } from "../Controllers/MentorController.js";


const router = express.Router();

// setting up routes
router.get("/",welcomePage)
router.post("/Register",CreateUser)
router.post("/Login",LoginUser)
router.put("/ForgotPassword",ForgotPassword)
router.put("/ResetPassword/:id/:pin/:token",PasswordReset)
router.put("/VerifyLink",VerifyUserLink)
router.get("/Verification/:id/:pin/:token",verifyUser)
router.get("/Logout",Logout)

router.post("/CreateStudent",Validate,isVerifiedAdmin,createStudent)
router.get("/students",Validate,getAllStudents)
router.get("/AssignMentees",Validate,assignMentees)
router.put("/AssignMentees/:id",Validate,isVerifiedAdmin,assignToMentor)
router.put("/ChangeMentor/:id",Validate,isVerifiedAdmin,changeMentor)
router.get("/PreviousMentor/:id",Validate,showPrevMentor)
router.delete("/DeleteStudent/:id",Validate,isVerifiedAdmin,deleteStudent)

router.post("/CreateMentor",Validate,isVerifiedAdmin,createMentor)
router.get("/mentors",Validate,allMentors)
router.get("/mentees/:id",Validate,getMentees)
router.delete("/DeleteMentor/:id",Validate,isVerifiedAdmin,deleteMentor)

export default router;