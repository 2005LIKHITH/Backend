import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new Schema({

    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,// Fast Searching but little expensive agr sab jagan index:true rakhliya hai toh band bajj jaatha hain

    },
    email:{
        type:String,
        required:true,
        lowercase:true,
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
        type:String // will come  from cloudinary
    },
    //we created a watch history array where each object of the array has the id of the video and its reference
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"Password is requiredd"]
        //should be hashedd using becrypt agr nahi kiya tho paytm jaisa haal hojayega 
    },
    refreshToken:{
        type:String
    }
},
{
    //time stamps are used to show the created time and the recently updated time 
    timestamps:true
}
);

// In Future we will use ZOD validation to take the validation to the next Level

//.pre is a MiddleWare Hook jaise Hi save hone keliye start hua file beech raasthe me usko pakad ke Ye waala operation 
//Karaya
userSchema.pre("save",async function(next){
    if(!(this.isModified("password"))){
        return next();
    }
    // Why async ?
    /*

        Because Hashing takes time.
        Jab Thak wo katham nahi hoga wahi par rukho

        Remember not to use Arrow Function becuase we are using this keyword
    
    */
    this.password = await bcrypt.hash(this.password,10);
    next();
})
//Custom Methods
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);

    //Now this method is available on any instance of userSchema
}

//JWT is bearer Token
// yeh token jiske bhi pass vusko hi baap maan letha hain
//we can use JWT via Authorization header or cookies

/*
    Authorization Header:More Protection but Manual handlng
    Cookies:Difficulty when server and client are on different ports , Prone to CRSF attacks,
    Automatic Handling



    At last Industry Practice is using Cookies
*/
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