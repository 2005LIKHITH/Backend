import mongoose from "mongoose";



import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`); 
        console.log(`\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);

        mongoose.connection.on('disconnected', () => {
            console.log("\nMongoDB disconnected");
        });
        mongoose.connection.on('reconnected', () => {
            console.log("\nMongoDB reconnected");
        });
    } catch (err) {
        console.log("MONGODB connection ERROR: ", err);
        process.exit(1);
    }
};


export default connectDB;
