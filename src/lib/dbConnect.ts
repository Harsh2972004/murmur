import mongoose from "mongoose";

const dbConnect = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) {
    return; // already connected or connecting — Mongoose handles this internally
  }

  try {
    console.log("Connecting with URI:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("DB Connected Successfully");
  } catch (error) {
    console.log("Database connection failed ", error);
    process.exit(1);
  }
};

export default dbConnect;
