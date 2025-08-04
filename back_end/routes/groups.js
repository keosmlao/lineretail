// routes/groups.js
import express from "express";
import db from "../utils/db.js";

const router = express.Router();

// GET /api/groups
router.get("/", async (req, res) => {
  try {
    const groups = await db("groups").orderBy("id");
    res.json(groups);
  } catch (err) {
    console.error("Get groups error:", err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

// POST /api/groups
router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Missing group name" });
  try {
    await db("groups").insert({ name });
    res.json({ success: true });
  } catch (err) {
    console.error("Insert group error:", err);
    res.status(500).json({ error: "Failed to create group" });
  }
});

// DELETE /api/groups/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db("groups").where({ id }).del();
    res.json({ success: true });
  } catch (err) {
    console.error("Delete group error:", err);
    res.status(500).json({ error: "Failed to delete group" });
  }
});

export default router;
