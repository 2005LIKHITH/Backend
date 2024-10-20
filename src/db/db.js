import mongoose from "mongoose";


//DB_NAME is not that much important to make it private but it is constatn so we are storing it in a constat.js file
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
        //.host contains ip address of the mongodb server

        const db = mongoose.connection;//returns an object 

        db.on('disconnected', () => {
            console.log("\nMongoDB disconnected");
        });
        db.on('reconnected', () => {
            console.log("\nMongoDB reconnected");
        });
    } catch (err) {
        console.log("MONGODB connection ERROR: ", err);
        process.exit(1);//is used to terminate the Node.js process and indicates that the 
        // process ended due to an error or some unexpected condition. 
    }
};

//Ab data base ke Baare re men koi chintha karne ka Zarrorat Nahi hain !!
export default connectDB;
