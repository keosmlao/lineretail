import { useState, useEffect } from "react";
import api from "../api";
export default function AssignRichMenu() {
  const [groups, setGroups] = useState([]), [menus, setMenus] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(""), [selectedMenu, setSelectedMenu] = useState("");
  useEffect(() => {
    api.get("/groups").then(res => setGroups(res.data));
    api.get("/richmenus").then(res => setMenus(res.data));
  }, []);
  const assign = async () => {
    if (!selectedGroup || !selectedMenu) return alert("เลือกกลุ่มและเมนู");
    await api.post("/assign", { group_id: selectedGroup, rich_menu_id: selectedMenu });
    alert("Assign สำเร็จ!");
  };
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Assign Rich Menu → Group</h2>
      <select className="border p-2 rounded mr-2" value={selectedGroup} onChange={e=>setSelectedGroup(e.target.value)}>
        <option value="">เลือกกลุ่ม</option>
        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
      <select className="border p-2 rounded" value={selectedMenu} onChange={e=>setSelectedMenu(e.target.value)}>
        <option value="">เลือก Rich Menu</option>
        {menus.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
      <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded" onClick={assign}>Assign</button>
      <a href="/dashboard" className="block mt-6 text-blue-700">← กลับหน้า Rich Menu</a>
    </div>
  );
}
