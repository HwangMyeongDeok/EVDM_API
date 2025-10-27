import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  DB_SERVER: process.env.DB_SERVER || "",
  DB_NAME: process.env.DB_NAME || "",
  DB_USER: process.env.DB_USER || "",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 4000,
  DB_INSTANCE: process.env.DB_INSTANCE || "",

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
};
