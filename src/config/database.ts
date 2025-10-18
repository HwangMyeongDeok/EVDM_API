import mongoose from "mongoose";
import config from "./index";

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("connected mongodb successfully");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;