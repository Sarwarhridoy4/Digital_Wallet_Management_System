/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import envConfig from "./config/env";
import app from "./app";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envConfig.DB_URL);
    console.log("🟢 Connected to MongoDB");




    server = app.listen(envConfig.PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${envConfig.PORT}`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
};

startServer();

const gracefulShutdown = (signal: string) => {
  console.log(`⚠️ ${signal} received... shutting down gracefully`);
  if (server) {
    server.close(() => {
      console.log("🛑 Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

// Handle process signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Rejection:", err);
  gracefulShutdown("unhandledRejection");
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
  gracefulShutdown("uncaughtException");
});
