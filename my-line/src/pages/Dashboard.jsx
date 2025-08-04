import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err);
      navigate("/unauthorized");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.display_name?.toLowerCase().includes(keyword.toLowerCase()) ||
      u.email?.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">👥 ผู้ใช้งานทั้งหมด</h1>
          <button
            onClick={fetchUsers}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 text-sm"
          >
            🔃 รีเฟรช
          </button>
        </div>

        <input
          type="text"
          placeholder="🔍 ค้นหาชื่อหรืออีเมล..."
          className="mb-4 w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-400"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3 border">#</th>
                <th className="p-3 border">รูป</th>
                <th className="p-3 border">ชื่อ</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Group</th>
                <th className="p-3 border">LINE ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-3 border text-center">{i + 1}</td>
                  <td className="p-3 border text-center">
                    <img
                      src={u.picture_url}
                      alt=""
                      className="w-10 h-10 rounded-full mx-auto"
                    />
                  </td>
                  <td className="p-3 border">{u.display_name}</td>
                  <td className="p-3 border">{u.email}</td>
                  <td className="p-3 border">{u.group_name || "-"}</td>
                  <td className="p-3 border text-gray-500">{u.user_id}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-400">
                    ไม่มีผู้ใช้งานที่ตรงกับคำค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
