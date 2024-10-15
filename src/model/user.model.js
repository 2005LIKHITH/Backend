import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({

    username:{
        type:String,
        required:true,
        unique:true,
        lowecase:true,
        trim:true,
        index:true,// Fast Searching but little expensive agr sab jagan index:true rakhliya hai toh band bajj jaatha hain

    },
    email:{
        type:String,
        required:true,
        lowecase:true,
        trim:true
    },
    fullname:{
        type:String,
        required:true,
        trim:true,

    },
    avatar:{
        type:String,//will come from the cloudinary
        required:true
    },
    coverImage:{
        type:String // willc oem from cloudinary
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"Password is requiredd"]
        //shold be hashedd
    },
    refreshToken:{
        type:String
    }
},
{
    timestamps:true
}
);
export const User =  mongoose.model("User",userSchema)
