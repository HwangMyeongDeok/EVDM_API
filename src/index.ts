import 'reflect-metadata';
import app from './app';
import { AppDataSource } from './config/data-source';
import { ENV } from './config';


const PORT = ENV.DB_PORT || 4000;

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('DATABASE CONNECTED!');
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();