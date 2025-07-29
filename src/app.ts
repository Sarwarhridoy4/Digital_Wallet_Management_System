// src/app.ts
import express, { Application, Request, Response } from "express";
import cors from "cors";

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (_req: Request, res: Response) => {
  res.send("🚀 Digital Wallet API is running...");
});

export default app;
