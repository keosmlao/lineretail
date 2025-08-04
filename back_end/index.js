import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Client, middleware } from '@line/bot-sdk';
import knex from 'knex';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
});

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
});
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });
const DEFAULT_RICH_MENU_ID = process.env.DEFAULT_RICH_MENU_ID || 'YOUR_DEFAULT_RICH_MENU_ID';

// === ฟังก์ชันเช็ค Rich Menu ที่ LINE assign ให้ user จริงๆ ===
async function getUserRichMenu(userId) {
  try {
    const res = await axios.get(
      `https://api.line.me/v2/bot/user/${userId}/richmenu`,
      {
        headers: { Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
      }
    );
    return res.data.richMenuId;
  } catch (e) {
    // ไม่มี rich menu จะ error 404
    return null;
  }
}

app.get('/api/groups', async (_, res) => {
  const { rows } = await pool.query('SELECT * FROM groups ORDER BY id');
  res.json(rows);
});

app.post('/api/groups', async (req, res) => {
  const { name } = req.body;
  await pool.query('INSERT INTO groups (name) VALUES ($1)', [name]);
  res.sendStatus(200);
});
// GET all rich menus
app.get('/api/richmenus', async (_, res) => {
  const { rows } = await pool.query('SELECT * FROM rich_menus ORDER BY id DESC');
  res.json(rows);
});

// POST create rich menu with image + layout + actions
app.post('/api/richmenus', upload.single('image'), async (req, res) => {
  const { name, layout = "1x1", actions = "[]" } = req.body;
  const rawActions = JSON.parse(actions);
  const imagePath = req.file.path;

  const layouts = {
    "1x1": { width: 2500, height: 843 },
    "2x1": { width: 2500, height: 843 },
    "3x2": { width: 2500, height: 1686 },
  };
  const { width, height } = layouts[layout];
  const resizedPath = imagePath.replace(/(\.[\w]+)$/, '_resized$1');
  await sharp(imagePath).resize(width, height).toFile(resizedPath);

  let areas = [], bounds = [];
  if (layout === "1x1") {
    bounds = [{ x: 0, y: 0, width, height }];
  } else if (layout === "2x1") {
    bounds = [
      { x: 0, y: 0, width: width / 2, height },
      { x: width / 2, y: 0, width: width / 2, height },
    ];
  } else if (layout === "3x2") {
    bounds = Array.from({ length: 6 }).map((_, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      return {
        x: col * (width / 3),
        y: row * (height / 2),
        width: width / 3,
        height: height / 2,
      };
    });
  }

  areas = bounds.map((b, i) => ({ bounds: b, action: rawActions[i] }));

  try {
    const richMenu = await client.createRichMenu({
      size: { width, height },
      selected: true,
      name,
      chatBarText: "เมนู",
      areas,
    });

    const imageBuffer = fs.readFileSync(resizedPath);
    await client.setRichMenuImage(richMenu, imageBuffer);

    await pool.query(
      `INSERT INTO rich_menus (name, rich_menu_id, image_path, layout, bounds, actions)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, richMenu, resizedPath, layout, JSON.stringify(bounds), actions]
    );

    res.status(201).json({ message: "Rich menu created", id: richMenu });
  } catch (err) {
    console.error("❌ Upload rich menu failed:", err);
    res.status(500).json({ error: "Failed to create rich menu" });
  }
});

// PUT update menu name only
app.put("/api/richmenus/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await pool.query(
      "UPDATE rich_menus SET name = $1 WHERE id = $2",
      [name, id]
    );
    res.json({ message: "Rich menu updated" });
  } catch (err) {
    console.error("❌ Update error", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// DELETE rich menu
app.delete('/api/richmenus/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const { rows } = await pool.query(
      'SELECT rich_menu_id, image_path FROM rich_menus WHERE id = $1',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Rich menu not found' });

    const { rich_menu_id, image_path } = rows[0];

    await pool.query('DELETE FROM group_rich_menu WHERE rich_menu_id = $1', [id]);

    try { await client.deleteRichMenu(rich_menu_id); } catch (err) {
      console.warn("⚠️ LINE delete failed:", err.message);
    }

    if (fs.existsSync(image_path)) fs.unlinkSync(image_path);
    await pool.query('DELETE FROM rich_menus WHERE id = $1', [id]);

    res.json({ message: 'Rich menu deleted' });
  } catch (err) {
    console.error('❌ Delete rich menu failed:', err);
    res.status(500).json({ error: 'Failed to delete rich menu' });
  }
});

app.post('/api/assign', async (req, res) => {
  const { group_id, rich_menu_id, set_as_default = false } = req.body;
  try {
    await pool.query('INSERT INTO group_rich_menu (group_id, rich_menu_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [group_id, rich_menu_id]);
    const { rows: users } = await pool.query('SELECT user_id FROM users WHERE group_id = $1', [group_id]);
    const { rows: menuRows } = await pool.query('SELECT rich_menu_id FROM rich_menus WHERE id = $1', [rich_menu_id]);
    const lineMenuId = menuRows[0]?.rich_menu_id;
    for (const user of users) {
      try { await client.unlinkRichMenuFromUser(user.user_id); } catch {}
      await client.linkRichMenuToUser(user.user_id, lineMenuId);
    }
    if (set_as_default) await client.setDefaultRichMenu(lineMenuId);
    res.json({ message: "Rich menu assigned successfully" });
  } catch (err) {
    console.error("❌ Assign menu error:", err);
    res.status(500).json({ error: "Failed to assign rich menu" });
  }
});

// DELETE /api/unassign/:group_id
app.delete("/api/unassign/:group_id", async (req, res) => {
  const group_id = req.params.group_id;

  // 1. หาผู้ใช้ในกลุ่ม
  const { rows } = await pool.query(`
    SELECT u.user_id, rm.rich_menu_id
    FROM users u
    JOIN group_rich_menu grm ON grm.group_id = u.group_id
    JOIN rich_menus rm ON rm.id = grm.rich_menu_id
    WHERE u.group_id = $1
  `, [group_id]);

  // 2. Unlink เมนูจากผู้ใช้ทุกคน
  for (const row of rows) {
    try {
      await client.unlinkRichMenuFromUser(row.user_id);
    } catch {}
  }

  // 3. ลบ record ใน group_rich_menu
  await pool.query("DELETE FROM group_rich_menu WHERE group_id = $1", [group_id]);

  res.json({ message: "Unassigned successfully" });
});


// GET /api/groups-assign
app.get("/api/groups-assign", async (req, res) => {
  const { rows } = await pool.query(`
    SELECT g.id AS group_id, g.name AS group_name,
           rm.id AS rich_menu_id, rm.name AS rich_menu_name,
           rm.image_path
    FROM groups g
    LEFT JOIN group_rich_menu grm ON grm.group_id = g.id
    LEFT JOIN rich_menus rm ON rm.id = grm.rich_menu_id
    ORDER BY g.id
  `);
  res.json(rows);
});


app.post("/api/liff/login", async (req, res) => {
  const { user_id, name, email, picture } = req.body;
  if (!user_id || !name) return res.status(400).json({ error: "Missing fields" });

  try {
    const { rows } = await pool.query(`
      INSERT INTO users (user_id, display_name, email, picture_url)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO UPDATE
      SET display_name = $2, email = $3, picture_url = $4
      RETURNING *;
    `, [user_id, name, email || '', picture || '']);

    const user = rows[0];
    console.log("✅ User logged in:", user.group_id);
    if (!user.group_id)
      return res.status(403).json({ error: "Unauthorized: No group assigned" });

    const { rows: menuRows } = await pool.query(`
      SELECT rm.rich_menu_id FROM group_rich_menu gr
      JOIN rich_menus rm ON rm.id = gr.rich_menu_id
      WHERE gr.group_id = $1 LIMIT 1
    `, [user.group_id]);

    const richMenuId = menuRows[0]?.rich_menu_id;

    if (richMenuId) {
      await client.linkRichMenuToUser(user_id, richMenuId);
    }

    res.json({ success: true, group_id: user.group_id, user });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/api/users', async (req, res) => {
  const { rows } = await pool.query(`SELECT u.id, u.display_name, u.email, u.user_id, u.picture_url, u.created_at, g.name AS group_name FROM users u LEFT JOIN groups g ON u.group_id = g.id ORDER BY u.created_at DESC`);
  res.json(rows);
});


app.post("/webhook", middleware({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
}), async (req, res) => {
  const events = req.body.events;
  console.log("Webhook called:", events?.length);
  // ...logic ตาม event ที่ต้องการ
  res.sendStatus(200);
});


app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});
