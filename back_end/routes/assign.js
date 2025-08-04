// routes/assign.js
import express from "express";
import db from "../utils/db.js";
import lineClient from "../utils/lineClient.js";

const router = express.Router();

// POST /api/assign (assign rich menu to group)
router.post("/", async (req, res) => {
  const { groupId, richMenuId } = req.body;
  try {
    const existing = await db("group_rich_menu").where({ group_id: groupId }).first();
    if (existing) {
      await db("group_rich_menu").update({ rich_menu_id: richMenuId }).where({ group_id: groupId });
    } else {
      await db("group_rich_menu").insert({ group_id: groupId, rich_menu_id: richMenuId });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Assign error:", err);
    res.status(500).json({ error: "Failed to assign rich menu" });
  }
});

// POST /api/assign-rich-menu (link rich menu to user based on group)
router.post("/rich-menu", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await db("users").where({ user_id: userId }).first();
    if (!user) return res.status(404).json({ error: "User not found" });

    const assign = await db("group_rich_menu")
      .join("rich_menus", "group_rich_menu.rich_menu_id", "rich_menus.id")
      .where("group_rich_menu.group_id", user.group_id)
      .select("rich_menus.rich_menu_id")
      .first();

    if (assign?.rich_menu_id) {
      await lineClient.linkRichMenuToUser(userId, assign.rich_menu_id);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Link menu error:", err);
    res.status(500).json({ error: "Failed to link rich menu" });
  }
});

export default router;
