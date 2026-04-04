import mongoose from "mongoose";

import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

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