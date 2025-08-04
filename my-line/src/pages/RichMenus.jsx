// src/pages/RichMenus.jsx
import { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";

function RichMenus() {
  const [menus, setMenus] = useState([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [layout, setLayout] = useState("1x1");
  const [actions, setActions] = useState([{ type: "message", text: "" }]);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    const res = await api.get("/api/richmenus");
    setMenus(res.data);
  };

  useEffect(() => {
    const count = layout === "1x1" ? 1 : layout === "2x1" ? 2 : 6;
    setActions(Array.from({ length: count }, () => ({ type: "message", text: "" })));
  }, [layout]);

  const handleActionChange = (index, key, value) => {
    const newActions = [...actions];
    newActions[index][key] = value;
    setActions(newActions);
  };

  const uploadMenu = async () => {
    if (!name || !file) return;
    const formData = new FormData();
    formData.append("name", name);
    formData.append("layout", layout);
    formData.append("image", file);
    formData.append("actions", JSON.stringify(actions));

    await api.post("/api/richmenus", formData);
    setName("");
    setFile(null);
    setLayout("1x1");
    setActions([{ type: "message", text: "" }]);
    fetchMenus();
  };

  const deleteMenu = async (id) => {
    if (!confirm("คุณแน่ใจว่าต้องการลบเมนูนี้?")) return;
    try {
      await api.delete(`/api/richmenus/${id}`);
      fetchMenus();
    } catch {
      alert("เกิดข้อผิดพลาดในการลบเมนู");
    }
  };

  const getOverlayAreas = (layout) => {
    const areas = [];
    const width = 2500;
    const height = layout === "3x2" ? 1686 : 843;

    if (layout === "1x1") {
      areas.push({ x: 0, y: 0, width, height });
    } else if (layout === "2x1") {
      areas.push(
        { x: 0, y: 0, width: width / 2, height },
        { x: width / 2, y: 0, width: width / 2, height }
      );
    } else if (layout === "3x2") {
      for (let i = 0; i < 6; i++) {
        const col = i % 3;
        const row = Math.floor(i / 3);
        areas.push({
          x: col * (width / 3),
          y: row * (height / 2),
          width: width / 3,
          height: height / 2,
        });
      }
    }
    return areas;
  };

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">🧾 จัดการ Rich Menu</h1>

        <div className="flex flex-col gap-2 mb-4">
          <input
            className="border px-3 py-2 rounded w-60"
            placeholder="ชื่อเมนู"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="border px-3 py-2 rounded w-60"
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
          >
            <option value="1x1">1x1</option>
            <option value="2x1">2x1</option>
            <option value="3x2">3x2</option>
          </select>

          {actions.map((a, i) => (
            <div key={i} className="border p-2 rounded mb-2">
              <label className="font-medium">ปุ่ม {i + 1}</label>
              <select
                value={a.type}
                onChange={(e) => handleActionChange(i, "type", e.target.value)}
                className="border p-1 w-40 mr-2"
              >
                <option value="message">📩 Message</option>
                <option value="uri">🌐 URI</option>
              </select>

              {a.type === "message" ? (
                <input
                  className="border p-1 w-64"
                  value={a.text || ""}
                  onChange={(e) => handleActionChange(i, "text", e.target.value)}
                  placeholder="ข้อความ"
                />
              ) : (
                <input
                  className="border p-1 w-64"
                  value={a.uri || ""}
                  onChange={(e) => handleActionChange(i, "uri", e.target.value)}
                  placeholder="https://example.com"
                />
              )}
            </div>
          ))}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            className="bg-green-600 text-white px-4 py-1 rounded w-32"
            onClick={uploadMenu}
          >
            📤 อัปโหลด
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {menus.map((m) => (
            <div key={m.id} className="border p-3 rounded shadow">
              <p className="font-semibold text-lg">{m.name}</p>
              {m.image_path && (
                <div className="relative mt-2">
                  <img
                    src={`http://localhost:5000/${m.image_path}`}
                    alt={m.name}
                    className="w-full rounded"
                  />
                  {getOverlayAreas(m.layout).map((area, i) => (
                    <div
                      key={i}
                      className="absolute border-2 border-red-500 bg-opacity-30 text-red-800 text-xs flex items-center justify-center"
                      style={{
                        left: `${(area.x / 2500) * 100}%`,
                        top: `${(area.y / (m.layout === "3x2" ? 1686 : 843)) * 100}%`,
                        width: `${(area.width / 2500) * 100}%`,
                        height: `${(area.height / (m.layout === "3x2" ? 1686 : 843)) * 100}%`,
                      }}
                    >
                      ปุ่ม {i + 1}
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => deleteMenu(m.id)}
                className="bg-red-500 text-white mt-3 px-3 py-1 rounded"
              >
                🗑️ ลบ
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default RichMenus;
