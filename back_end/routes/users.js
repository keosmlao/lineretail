// routes/users.js
import express from "express";
import db from "../utils/db.js";

const router = express.Router();

// GET /api/users
router.get("/", async (req, res) => {
  try {
    const users = await db("users")
      .leftJoin("groups", "users.group_id", "groups.id")
      .select("users.*", "groups.name as group_name")
      .orderBy("users.id", "asc");
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
