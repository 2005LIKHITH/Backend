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

//
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


        //Iss route me refresh token create nahi hua

    )


}); 
const generateAccessAndRefreshToken = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        // console.log(user)
        const accessToken = user.generateAccessToken()

        

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })//Ham ab koi check nahi kar rahe hai                                                                                                                                                                                                                                                                                    

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



// this is how in via authorization header const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"






})
const logOutUser = asyncHandler(async(req,res)=>{
    //Middleware jaane se pehle milke jaayeyega

    await User.findByIdAndUpdate(req.user._id,{
        //use operator
        $unset:{
            refreshToken:1
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
            new ApiResponse(200,{accessToken:accessToken,refreshToken:newrefreshToken},"Access Token Refreshed Successfully !!") 
    
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

const getUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(200,req.user, "Current User Fetched Successfully !!")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email} = req.body;
    if(!(fullName && email))throw new ApiError(400,"All fields are required")
    
    const user = await User.findById(req.user?._id,

        {
            $set:{
                fullName,
                email

            }
        },
        {new:true}// update hone ka badd jo bhi information hotha hain wo hamare paas aate hain


    ).select("-password","-refreshToken")

    return res.status(200).json(new ApiResponse(200,user,"User Details Updated Successfully !!"))
    
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
    //Update User Cover Image

    const userDetail = await User.findById(req.user?._id);
    const beforeCoverImage =  userDetail?.coverImage;

    

    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath)throw new ApiError(400,"CoverImage  file is required");
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage.url)throw new ApiError(400,"Error while uploading coverImage");

    const user = await User.findByIdAndUpdate(req.user?._id,

        {
            $set:{
                coverImage:coverImage.url
            } 


        },{new:true}// update hone ka badd jo bhi information hotha hain wo hamare paas aate hain

    ).select("-password","-refreshToken")


    try{

        const beforeCoverImageUrl = beforeCoverImage?.url
        const publicId = beforeCoverImageUrl?.split("/").pop().split(".")[0];

        await deleteOnCloudinary(publicId);

        console.log("Previous cover image has been deleted successfully");

    }catch(err){
        throw new ApiError(500,err?.message || "Not able to delete previous Cover image");
    }
       
    return res.status(200).json(
        new ApiResponse(200,user,"User Details Updated Successfully !!")
    )

})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    //Update User Avatar
    const userDetail = await User.findById(req.user?._id);
    const beforeAvatar =  userDetail?.avatar;
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath)throw new ApiError(400,"Avatar file is required");
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url)throw new ApiError(400,"Error while uploading avatar");

    const user = await User.findByIdAndUpdate(req.user?._id,

        {
            $set:{
                avatar:avatar.url
            } 


        },{new:true}// update hone ka badd jo bhi information hotha hain wo hamare paas aate hain

    ).select("-password","-refreshToken")
    //Deleting an user Avatar Bro Let Do it 
    /*
        Purane Avatar ko delete karna acchi baat hai lekin Avatar update hone se pehla delete  karna ye Axhi baat nahi hain :)

        In Cloudinary, the public ID is a unique identifier for each uploaded asset (like images, videos, etc.).
        When you upload a file to Cloudinary, it generates a public ID that you can use to reference that file later 
        for various operations, including deletion.

    */
    try{
        const beforeAvatarUrl = beforeAvatar?.url;
        const publicId = beforeAvatarUrl?.split("/").pop().split(".")[0];
        await deleteOnCloudinary(publicId);
    
        console.log("Old Avatar Deleted Successfully !!");

    }catch(err){

        throw new ApiError(500,err?.message || "Error while deleting old avatar");

    }




    return res.status(200).json(
        new ApiResponse(200,user,"User Details Updated Successfully !!")
    )

})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        //filters from the users context using mqtch
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])
    //console.log(channel)

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})
//Understand the context when working with chained pipelines

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                                //convert array of objects to object
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})

export { registerUser , loginUser  , logOutUser,refreshAccessToken,changePassword,
     getUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory};
