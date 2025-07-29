// src/app.ts
import express, { Application, Request, Response } from "express";
import cors from "cors";
import envConfig from "./config/env";
import cookieParser from "cookie-parser";
import httpStatus from "http-status-codes";
import notFound from "./middlewares/notFound";

const app: Application = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: envConfig.FRONTEND_URL,
    credentials: true,
  })
);

// Application Entry Point
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the Digital Wallet Management System API",
    status: httpStatus.OK,
    data: {
      version: "1.0.0",
      description: "API for managing digital wallets",
    },
  });
});

app.use(notFound);

export default app;
