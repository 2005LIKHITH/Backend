import dotenv from "dotenv"
import connectDB from './db/db.js';
import {app} from './app.js'//Jho asli kaam hoga yaha se chaalu hoga route vaghera

dotenv.config({
    path: './.env'
})
// const app = express();

// console.log(process.env.MONGODB_URI);
connectDB().then(()=>{


    //we got our app from app.js Dyanan Rakho Bhai
    //Agar Connection Successful Hua then it will connect to the express

    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`⚙️ Server started on port ${process.env.PORT || 8000}`);
    })
    // app.on("error", (err)=>{
    //     throw console.log("MongoDB Connection FAILED !!!",err);
    // }) This block is Obsolete
}).catch((err)=>{
    console.log("MongoDB Connection FAILED !!!",err);
});
// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })
