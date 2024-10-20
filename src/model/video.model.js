import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; //helps loading  large chunks of data (like videos)
const videoSchema = new Schema({
   videoFile:{
    type:String,//cloudinary
    required:true
   },
   thumbnail:{
    type:String,//cloudinary
    required:true
   },
   title:{
    type:String,
    required:true
   },
   description:{
    type:String,
    required:true
   },
   duration:{
    //cloudinary
    type:Number,
    required:true
    //we can get duration directly from cloudinary
   },
   views:{
    type:Number,
    default:0
   },
   isPublished:{
    type:Boolean,
    default:true
   },

   owner:{
    type:Schema.Types.ObjectId,
    ref:'User',
   }


},
{
    timestamps: true
});

videoSchema.plugin(mongooseAggregatePaginate);
//Now we can write aggregation queries


export const Video = mongoose.model('Video', videoSchema);//Remember this will be stored 'videos' in database
