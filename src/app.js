import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));
app.use(express.urlencoded({extended:true,limit:"16kb "}))//data came via url
app.use(express.static("public"))//Public folder name to save images and fevicon


export{app}