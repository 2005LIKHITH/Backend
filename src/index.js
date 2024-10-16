import dotenv from "dotenv"
import express from 'express'
import connectDB from './db/db.js'; // Import your database connection

// Load environment variables from a custom path
dotenv.config({
    path: './.env'
})
const app = express();

console.log(process.env.MONGODB_URI);
connectDB().then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server started on port ${process.env.PORT || 8000}`);
    })
    app.on("error", (err)=>{
        throw console.log("MongoDB Connection FAILED !!!",err);
    })
}).catch((err)=>{
    console.log("MongoDB Connection FAILED !!!",err);
});
app.get('/', (req, res) => {
  res.send('Hello World!')
})
