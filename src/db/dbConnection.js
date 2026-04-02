import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URI)
    console.log(
      "Mongo DB Connected !!", 
      connect.connection.host, 
      connect.connection.name,
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}