// src/app.ts
import express, { Application, Request, Response } from "express";
import cors from "cors";

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the Digital Wallet Management System API",
    status: "success",
    data: {
      version: "1.0.0",
      description: "API for managing digital wallets",
    },
  });
});

export default app;
