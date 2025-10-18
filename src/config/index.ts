import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 4000,

  mongoUri: process.env.MONGODB_URI as string,

  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN as string,
  },
};

if (!config.mongoUri || !config.jwt.secret) {
  console.error("FATAL ERROR: Missing required environment variables.");
  process.exit(1);
}

export default config;