import { useState } from "react";
import api from "../api";

export default function AdminLogin() {
  const [user, setUser] = useState(""), [pass, setPass] = useState(""), [err, setErr] = useState("");
  const handleLogin = async () => {
    try {
      const res = await api.post("/admin/login", { user, pass });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/dashboard";
    } catch {
      setErr("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-96">
        <h1 className="font-bold text-2xl mb-4">Admin Login</h1>
        <input className="border p-2 mb-2 w-full" placeholder="Username" value={user} onChange={e=>setUser(e.target.value)} />
        <input className="border p-2 mb-2 w-full" type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} />
        {err && <div className="text-red-500 mb-2">{err}</div>}
        <button className="bg-blue-600 text-white p-2 w-full rounded" onClick={handleLogin}>เข้าสู่ระบบ</button>
      </div>
    </div>
  );
}
