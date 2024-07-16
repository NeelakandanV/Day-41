import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.mongdbUrl;
module.exports = {dbUrl}