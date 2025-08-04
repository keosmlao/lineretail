// routes/liff.js
import express from "express";
import { verifyIdToken } from "../utils/lineVerify.js";
import db from "../utils/db.js";

const router = express.Router();

// POST /api/liff/login
router.post("/login", async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: "Missing idToken" });
  }

  try {
    const decoded = await verifyIdToken(idToken);

    const {
      sub: user_id,
      name: display_name,
      picture: picture_url,
      email,
    } = decoded;

    // Ensure default group_id exists
    const defaultGroup = await db("groups").where({ id: 1 }).first();
    if (!defaultGroup) {
      await db("groups").insert({ id: 1, name: "Default" });
    }

    // Try insert user if not exists
    await db("users")
      .insert({
        user_id,
        display_name,
        picture_url,
        email,
        group_id: 1,
      })
      .onConflict("user_id") // ✅ กัน duplicate
      .ignore();

    // Always return user info
    const user = await db("users").where({ user_id }).first();
    res.json(user);
  } catch (err) {
    console.error("❌ LIFF login failed:", err?.response?.data || err.message);
    res.status(401).json({ error: "Invalid ID token", detail: err?.response?.data || err.message });
  }
});

export default router;
