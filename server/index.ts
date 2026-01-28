import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { connectDatabase } from "./config/database.js";
import adminRoutes from "./routes/admin/index.js";
import clientRoutes from "./routes/client/index.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import swaggerSpec from "./config/swagger.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

connectDatabase();

app.get("/", (_, res) => {
  res.send("Backend is running 🚀");
});

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount routes
app.use("/api/admin", adminRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/chatbot", chatbotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
