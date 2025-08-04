// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import liffRoutes from "./routes/liff.js";
import userRoutes from "./routes/users.js";
import groupRoutes from "./routes/groups.js";
import menuRoutes from "./routes/richmenus.js";
import assignRoutes from "./routes/assign.js";
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/liff", liffRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/richmenus", menuRoutes);
app.use("/api/assign", assignRoutes);

app.get("/api/admin/profile", (req, res) => {
  res.json({ username: "admin" });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));