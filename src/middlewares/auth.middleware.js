//User hai ya nahi hai

import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

import { User } from "../model/user.model.js";
const verifyJWT = asyncHandler(async(req,res,next)=>{
    //Ya  Tho cookies se access token aayega ya Toh Authorization header se token Aayega Bhai => as simple as that
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

        if(!token)throw new ApiError(401,"UnAuthorized Request !!");
        //Token Sahi hai ya Nahi 
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");  
    
        if(!user)throw new ApiError(401,"Invalid AccessToken");
    
        req.user = user;//AB you can access the object_id things from token
        next();
    }catch(err){
        throw new ApiError(401,err?.message || "Invalid Access Token");
    }



})
export {verifyJWT }