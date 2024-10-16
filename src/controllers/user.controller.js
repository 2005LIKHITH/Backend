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
   const existingUser =  User.findOne({
        $or:[{username},{email}]
        
    })

    if(existingUser)throw new ApiError(409,"User already exists");
    const avatarLocalPath = req.files?.avatar[0]?.path;//if you later upload muliple files [0] helps
    const coverImageLocalPath = req.files?.cover[0]?.path;

    if(!avatarLocalPath)throw new ApiError(400,"Avatar is required");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage  = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar)throw new ApiError(400,"Avatar upload failed");

    const user = User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase(),


    })

    const createdUser = await user.findbyObjectId(user._id).select(
        "-password -refreshToken" //we don't want to send password and refreshToken
    );

    if(!createdUser)throw new ApiError(500,"Something went wrong while registering the user");

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully !!")
    )


}); 

export { registerUser };
