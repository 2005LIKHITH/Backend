import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
//fs => file system form node js
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
}); 

const uploadOnCloudinary = async (localFilePath)=>{
    try{
        if(!localFilePath)return null;
        const response  = cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
        })
        //file has been uploaded sucessfully
        console.log("File has been uploaded sucessfully",response.url);
        return response;
    }catch(error){
        fs.unlink(localFilePath); 
        //remove the locally saved temporary file as the operation cloud
        return null;
    }
}

export  {uploadOnCloudinary}