import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false, // Disable logging
  }
);

//database update and create
export const connectDB = async () => {
    try {
      await sequelize.authenticate(); // Ensure tables are updated
      console.log("Database connected successfully");
    } catch (e) {
      console.error("Failed to connect to the database:", e);
      process.exit(1);
    }
  };
