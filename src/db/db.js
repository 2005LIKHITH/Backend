import mongoose from "mongoose";



import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
//         console.log(`Connected to Database: ${DB_NAME}`);
//         console.log("MONGODB_URI:", process.env.MONGODB_URI);
// console.log("DB_NAME:", DB_NAME);
// console.log("Final Connection URI:", `${process.env.MONGODB_URI}/${DB_NAME}`);

        // mongoose.connect will return us an instance of the connection 

        //DB_NAME naamak database banayega Iss provided URL Me 
        // console.log(process.env.MONGODB_URI)
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`); 
        console.log(`\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
        //so what we are doing using we are creating a database named DB_NAME in the host
        const db = mongoose.connection;

        db.on('disconnected', () => {
            console.log("\nMongoDB disconnected");
        });
        db.on('reconnected', () => {
            console.log("\nMongoDB reconnected");
        });
    } catch (err) {
        console.log("MONGODB connection ERROR: ", err);
        process.exit(1);
    }
};

//Ab data base ke Baare re men koi chintha karne ka Zarrorat Nahi hain !!
export default connectDB;
