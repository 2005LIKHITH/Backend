import { asyncHandler } from "../utils/asyncHandler.js";

import ApiError from "../utils/ApiError.js";
import {User} from "../model/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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

        //Like bitwise OR
        
    })

    if(existingUser)throw new ApiError(409,"User already exists");
    // console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;//if you later upload muliple files [0] helps
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    /*

        How multer is managing things

`   req.files = {
    avatar: [
        {
            fieldname: "avatar",
            originalname: "myAvatar.jpg",
            encoding: "7bit",
            mimetype: "image/jpeg",
            destination: "uploads/",
            filename: "someUniqueFileName.jpg",
            path: "uploads/someUniqueFileName.jpg",
            size: 12345,
        }
    ]
};


    */
    if(!coverImageLocalPath)throw new ApiError(400,"Cover Image is required");
    if(!avatarLocalPath)throw new ApiError(400,"Avatar is required");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage  = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar)throw new ApiError(400,"Avatar upload failed");
    //Cover Image is not neccessary

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase(),

        //'.create()' incorporates the  '.save()' functionality
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" //we don't want to send password and refreshToken
    );

    if(!createdUser)throw new ApiError(500,"Something went wrong while registering the user");

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully !!")

        //it will show 201 in post man 
    )


}); 
const generateAccessAndRefreshToken = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        // console.log(user)
        const accessToken = user.generateAccessToken()

        

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
const loginUser = asyncHandler(async(req,res)=>{
    const {email,password,username} = req.body;
    // console.log({email,password,username});
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
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

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);



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
const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    //req.body.refreshTOken used for mobile
    if(!incomingRefreshToken)throw new ApiError(400,"Unauthorized Request !!");

    try{
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        )
    
        const user= await User.findById(decodedToken?._id)
        if(!user)throw new ApiError(401,"Invalid Refresh Token");
    
        if(incomingRefreshToken !== user?.refreshToken)throw new ApiError(401,"Refresh Token is Expired or Used");
    
    
        const options = {
            httpOnly:true,
            secure:true
        }
        const {accessToken,newrefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res.status(200).cookie("accessToken",accessToken,options)
        .cookie("newrefreshToken",newrefreshToken,options).json(
            new ApiResponse(200,{accessToken,refreshToken:newrefreshToken},"Access Token Refreshed Successfully !!") 
    
        )    
    }catch(err){
        throw new ApiError(401,err?.message || "Invalid Refresh Token");
    }









})
const changePassword = asyncHandler(async(req,res)=>{
    const {currentPassword,newPassword,confirmPassword} = req.body  
    if(!(currentPassword && newPassword && confirmPassword))throw new ApiError(400,"All fields are required");
    if(newPassword !== confirmPassword)throw new ApiError(400,"Passwords do not match");
    

    //Already user logged in so uske paas access token aayega
    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
    if(!isPasswordCorrect)throw new ApiError(400,"Current password is incorrect");
    user.password = newPassword;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,"Password Changed Successfully !!"))


})


export { registerUser , loginUser  , logOutUser,refreshAccessToken,changePassword};
