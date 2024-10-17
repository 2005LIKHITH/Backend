import { asyncHandler } from "../utils/asyncHandler.js";

import ApiError from "../utils/ApiError.js";
import {User} from "../model/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
    // Here, you might want to add your registration logic
    // res.status(200).json({ message: "REGISTERED USER !!" });
    const{fullName,email,username,password} = req.body; 
    console.log({fullName,email,username,password});

    if(
        [fullName,email,username,password].some((field)=>field?.trim().length === 0)
    ){
        throw new ApiError(400,"All fields are required");
    }
   const existingUser =  await User.findOne({
        $or:[{username},{email}]
        
    })

    if(existingUser)throw new ApiError(409,"User already exists");
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;//if you later upload muliple files [0] helps
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!coverImageLocalPath)throw new ApiError(400,"Cover Image is required");
    if(!avatarLocalPath)throw new ApiError(400,"Avatar is required");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage  = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar)throw new ApiError(400,"Avatar upload failed");

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase(),


    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" //we don't want to send password and refreshToken
    );

    if(!createdUser)throw new ApiError(500,"Something went wrong while registering the user");

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully !!")
    )


}); 
const generateAcessAndRefreshToken = async(userId)=>{
    try{
        const user = await User.findById(userId);
        if(!user)throw new ApiError(404,"User not found");

        const accessToken = user.generateAcessToken();
        const refreshToken = user.generateRefreshToken();
        // return {accessToken,refreshToken}
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false}); //Improve teh speed of the development 

        return {accessToken,refreshToken};
    }catch(err){
        throw new ApiError (500,"Something went wrong while generating access and refresh token");  
    }
}

const loginUser = asyncHandler(async(req,res)=>{
    const {email,password,username} = req.body;
    if(!username && !email)throw new ApiError(400,"Username or Email is required");
    if(!password)throw new ApiError(400,"Password is required");

    const user = await User.findOne({
        $or:[{username},{email}]
        //bit wise or ki Tarah
    })
    //donom me se koi bhi mil gaya tho object info leke waaps ajaao 
    //User nahi mila
    if(!user)throw new ApiError(401,"Invalid Credentials");
    
    //password sahi hai kya ya nahi

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect)throw new ApiError(401,"Invalid Credentials");

    const {accessToken,refreshToken} = await generateAcessAndRefreshToken(user._id);



    //User ko kya kya information bejna hai

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly:true,
        secure:true
        //Only Accessible from the Server Side

    }
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,
        {
            //If we user want to access the refresh token and accesstoken by himself to devlelop any application he can do it 
            user: loggedInUser,accessToken,refreshToken,

        },
        "User Logged in Successfully !!"
    ))









})
const logOutUser = asyncHandler(async(req,res)=>{
    //Middleware jaane se pehle milke jaayeyega

    await User.findByIdAndUpdate(req.user._id,{
        //use operator
        $set:{
            refreshToken:undefined
        },


    },
    {
        new: true // will get the updated user
    }


)
   const options = {
    httpOnly:true,
    secure:true
   } 
   return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options)
   .json(new ApiResponse(200,"User Logged out Successfully !!"))




})

export { registerUser , loginUser  , logOutUser};
