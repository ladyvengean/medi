

import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI.endsWith("/")
            ? `${process.env.MONGODB_URI}${DB_NAME}`
            : `${process.env.MONGODB_URI}/${DB_NAME}`;

        console.log(`Connecting to: ${uri}`);

        const connectioInstance = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`\nMongoDB connected! DB Host: ${connectioInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

export default connectDB;



