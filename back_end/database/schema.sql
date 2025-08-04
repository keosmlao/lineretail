CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE rich_menus (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  rich_menu_id TEXT,
  image_path TEXT
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE,
  display_name TEXT,
  email TEXT,
  picture_url TEXT,
  group_id INTEGER REFERENCES groups(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_rich_menu (
  group_id INTEGER REFERENCES groups(id),
  rich_menu_id INTEGER REFERENCES rich_menus(id),
  PRIMARY KEY (group_id, rich_menu_id)
);
