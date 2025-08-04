import { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";

function Groups() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/groups");
      setGroups(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!name.trim()) return;
    try {
      await api.post("/api/groups", { name });
      setName("");
      fetchGroups();
    } catch (err) {
      console.error("❌ Failed to create group:", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">👥 จัดการกลุ่ม</h1>

        <div className="flex items-center gap-2 mb-6">
          <input
            className="border px-4 py-2 rounded w-full max-w-sm shadow-sm focus:outline-none focus:ring focus:border-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ชื่อกลุ่มใหม่"
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm"
            onClick={createGroup}
          >
            ➕ เพิ่ม
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">🔄 กำลังโหลด...</p>
        ) : groups.length === 0 ? (
          <p className="text-gray-400">ยังไม่มีกลุ่ม</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {groups.map((g) => (
              <li
                key={g.id}
                className="border px-4 py-3 rounded shadow-sm bg-white hover:shadow-md transition"
              >
                <span className="font-medium text-gray-800">{g.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default Groups;

