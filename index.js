import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB, sequelize } from "./database/database.js";
import journalRoutes from "./routes/journalRoute.js";
import authRoutes from "./routes/authRoute.js";

dotenv.config(); // Load environment variables

sequelize
  .sync({ force: false }) // Set `force: true` only if you want to drop and recreate tables
  .then(() => {
    console.log("Database synced successfully.");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

const app = express();

//Ensure required environment variables are set
if (!process.env.PORT) {
  console.error("Missing required environment variable: PORT");
  process.exit(1);
}

// ORS Configuration (Allow multiple origins if needed)
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || "http://localhost:5173",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json()); // Parse JSON request body

// 🔹 Function to start the server
const startServer = async () => {
  try {
    await connectDB(); // Connect to the database
    await sequelize.sync({ alter: true }); // Update tables without dropping data

    console.log("Database connected successfully.");

    // Register routes
    app.use("/api/journals", journalRoutes);
    app.use("/api", authRoutes);

    console.log("Routes registered successfully.");

    // Start the server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

// 🔹 Graceful error handling
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
