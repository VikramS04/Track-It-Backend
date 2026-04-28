import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

const globalForMongoose = globalThis;

globalForMongoose.trackItMongoose = globalForMongoose.trackItMongoose || {
  conn: null,
  promise: null,
};

export const connectDb = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (globalForMongoose.trackItMongoose.conn) {
    return globalForMongoose.trackItMongoose.conn;
  }

  if (!globalForMongoose.trackItMongoose.promise) {
    globalForMongoose.trackItMongoose.promise = mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    const connect = await globalForMongoose.trackItMongoose.promise;
    globalForMongoose.trackItMongoose.conn = connect.connection;

    console.log(
      "Mongo DB Connected !!", 
      connect.connection.host, 
      connect.connection.name,
    );

    return connect.connection;
  } catch (error) {
    globalForMongoose.trackItMongoose.promise = null;
    throw error;
  }
};
