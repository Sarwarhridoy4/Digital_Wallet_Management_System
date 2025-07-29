import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: string;
  DB_URL: string;
  NODE_ENV: "development" | "production";
  FRONTEND_URL: string;
}
const envConfig: EnvConfig = {
  PORT: process.env.PORT || "3000",
  DB_URL: process.env.DB_URL || "mongodb://localhost:27017/digital_wallet",
  NODE_ENV:
    (process.env.NODE_ENV as "development" | "production") || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};
export default envConfig;
