import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
    fullName:{
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
//.pre is a hook
userSchema.pre("save",async function(next){
    if(!(this.isModified("password"))){
        return next();
    }
    this.password = await bcrypt.hash(this.password,10);
    next();
})
//Custom Methods
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}
//JWT is bearer Token
// yeh token jiske bhi pass vusko hi baap maan letha hain

 userSchema.methods.generateAccessToken =  function(){

    return  jwt.sign(
        //Given payload
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
 }
 userSchema.methods.generateRefreshToken =  function(){
    return jwt.sign(
        {
            _id:this._id
        },process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
 }
 export  const User =  mongoose.model("User",userSchema);

// USER -> MULTER -> {STORE IN TEMP of USER} -> (form Local Store) -> Cloudinary