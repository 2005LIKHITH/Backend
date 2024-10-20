import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()


//Cross Origin Resource Sharing

app.use(cors({
    origin: process.env.CORS_ORIGIN,// Here we set that we will accept them from any wehre CORS_ORIGIN =*
    credentials: true//Setting this to true allows cookies and other credentials to 
    // be sent with cross-origin requests, which is important for authenticated sessions.
}))


//Middleware's

app.use(express.json({limit: "16kb"}))//Json Payloads 
app.use(express.urlencoded({extended: true, limit: "16kb"}))//Url encoded payloads
app.use(express.static("public"))//we can serve the files which doesn't need any server side rendering

/*

    In More Detail

    When a request is made for a file 
    (e.g., http://yourdomain.com/style.css), Express will look in the public folder 
    for style.css and serve it directly.

*/
app.use(cookieParser())//Basicaly a Cookie Handler , like Drug Handler LmaO :)


//routes import
import userRouter from './routes/user.routes.js'

//routes declaration


app.use("/api/v1/users", userRouter)//Jo bhi userRouter pe jaraheho usko ye chipka ke bhejdo




export { app }