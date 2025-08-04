-- 🧑‍💼 ตารางผู้ใช้ LINE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,         -- LINE userId
    display_name TEXT,
    picture_url TEXT,
    email TEXT,
    group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 👥 ตารางกลุ่มผู้ใช้
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,            -- เช่น Admin, Member, Staff
    description TEXT
);

-- 📋 ตาราง Rich Menu
CREATE TABLE rich_menus (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,                   -- ชื่อที่ admin ตั้ง เช่น "Menu 1"
    rich_menu_id TEXT UNIQUE NOT NULL,    -- richMenuId จาก LINE API
    image_url TEXT,                       -- URL รูป rich menu
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 🔗 ตารางเชื่อม Group <-> Rich Menu
CREATE TABLE group_rich_menu (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    rich_menu_id INTEGER NOT NULL REFERENCES rich_menus(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT NOW()
);


-- 👥 กลุ่มเริ่มต้น
INSERT INTO groups (name, description)
VALUES 
  ('Admin', 'System Administrator'),
  ('Customer', 'General User'),
  ('Staff', 'Company Staff');

-- 🧪 Rich Menu เริ่มต้น
INSERT INTO rich_menus (name, rich_menu_id, image_url, description)
VALUES 
  ('Default Menu', 'richmenu-abc123', 'https://yourdomain.com/images/default.png', 'Main menu for new users');
