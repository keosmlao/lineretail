import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import mime from "mime"; // ⬅️ ใช้ตรวจสอบ content-type
import db from "../utils/db.js";
import lineClient from "../utils/lineClient.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

// GET /api/richmenus
router.get("/", async (req, res) => {
  try {
    const menus = await db("rich_menus").orderBy("id", "desc");
    res.json(menus);
  } catch (err) {
    console.error("Fetch menus error:", err);
    res.status(500).json({ error: "Failed to load menus" });
  }
});

// POST /api/richmenus/upload
router.post("/upload", upload.single("image"), async (req, res) => {
  const { name, areas } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  let parsedAreas = [];
  try {
    parsedAreas = JSON.parse(areas);
  } catch (err) {
    return res.status(400).json({ error: "Invalid areas JSON" });
  }

  const { filename, path: filePath } = req.file;

  try {
    // 1. Create rich menu
    const richMenu = await lineClient.createRichMenu({
      size: { width: 2500, height: 843 },
      selected: true,
      name,
      chatBarText: "Menu",
      areas: parsedAreas,
    });

    // 2. Upload image with proper content-type
    const contentType = mime.getType(filePath) || "image/png";
    await lineClient.setRichMenuImage(
      richMenu.richMenuId,
      fs.createReadStream(filePath),
      contentType
    );

    // 3. Save to DB
    await db("rich_menus").insert({
      name,
      rich_menu_id: richMenu.richMenuId,
      image_url: `/uploads/${filename}`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Upload rich menu error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to upload rich menu", detail: err.message });
  }
});

export default router;
