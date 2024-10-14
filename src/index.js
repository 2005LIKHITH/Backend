import dotenv from "dotenv"
import express from 'express'
import connectDB from './db/db.js';


dotenv.config({
    path: './.env'
})
const app = express();

console.log(process.env.MONGODB_URI);
connectDB().then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server started on port ${process.env.PORT || 8000}`);
    })

}).catch((err)=>{
    console.log("MongoDB Connection FAILED !!!",err);
});
app.on("error", (err)=>{
    throw console.log("MongoDB Connection FAILED !!!",err);
})
