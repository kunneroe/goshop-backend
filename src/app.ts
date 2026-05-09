import cors from "cors";
import express from "express";
import { healthRouter } from "./routes/health.routes";
import { authRouter } from "./routes/auth.routes";

export const app = express();

app.use(cors());
app.use(express.json());

// Mount app routes
app.use("/", healthRouter);
app.use("/api/v1/auth", authRouter);
