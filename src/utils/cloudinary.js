import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
//fs => file system form node js
import dotenv from "dotenv"

dotenv.config({
    path: './.env'
})
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
}); 
// console.log(process.env.CLOUDINARY_API_SECRET);
// console.log(process.env.CLOUDINARY_CLOUD_NAME);
// console.log(process.env.CLOUDINARY_API_KEY);

const uploadOnCloudinary = async (localFilePath)=>{
    try{
        if(!localFilePath)return null;
        const response  = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
        })
        //file has been uploaded sucessfully
        // console.log("File has been uploaded sucessfully",response.url);
        fs.unlinkSync(localFilePath)
        return response;
    }catch(error){
        // Attempt to delete the local file even if the upload failed
        if (localFilePath && fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath); // Safely delete local file
            } catch (unlinkError) {
                console.error("Error deleting local file:", unlinkError);
            }
        }

        // Return null to indicate the upload failed
        return null;
    }
        //remove the locally saved temporary file as the operation cloud}
}
const deleteOnCloudinary = async(publicId)=>{
    if(!publicId)throw new ApiError(500,"Not able to delete previous image");

    try{

        const response = await cloudinary.uploader.destroy(publicId);
        console.log("File has been deleted sucessfully",response);
        return response;
    }catch(err){
        console.error("Error deleting file from Cloudinary:",err);
        throw new ApiError(500,"Not able to delete previous image");
    }
}

export  {uploadOnCloudinary,deleteOnCloudinary}