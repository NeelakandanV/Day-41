// Importing Dependencies
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import cookieParser from "cookie-parser";
import DBconnect from "./Utils/dbConfig.js";
import requestLogger from "./Utils/logger.js";
import unknownEndpoint from "./Utils/Error.js";
import MainRouter from "./Routers/MainRouter.js"


// Applying Middlewares
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(cookieParser());


//Connecting  to Database
DBconnect();

//Routes
app.use("/",MainRouter)
app.all("*",unknownEndpoint)


const Port = process.env.PORT || 8000;
app.listen(Port,()=>console.log(`App is listening on ${Port}`))