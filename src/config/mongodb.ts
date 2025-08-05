import mongoose from "mongoose";
import { config } from "./index";

export const connectDB = async () => {
    try {
        console.log("Attempting to connect to MongoDB...");
        console.log("MongoDB URL:", config.MONGODB_URL);
        
        await mongoose.connect(config.MONGODB_URL);
        console.log("✅ Connected to MongoDB successfully");
        
        // Handle connection events
        mongoose.connection.on("error", (error) => {
            console.error("❌ MongoDB connection error:", error);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("📴 MongoDB disconnected");
        });

        // Graceful shutdown
        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            console.log("🔌 MongoDB connection closed through app termination");
            process.exit(0);
        });

    } catch (error: any) {
        console.error("❌ Error connecting to MongoDB:", error);
        console.error("Error details:", error?.message || "Unknown error");
        process.exit(1);
    }
};

export const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        console.log("✅ MongoDB disconnected successfully");
    } catch (error: any) {
        console.error("❌ Error disconnecting from MongoDB:", error);
    }
};

export const isConnected = (): boolean => {
    return mongoose.connection.readyState === 1;
};