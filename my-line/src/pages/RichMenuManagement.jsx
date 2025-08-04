import { useState, useEffect } from "react";
import api from "../api";
import RichMenuBuilder from "../components/RichMenuBuilder";

export default function RichMenuManagement() {
  const [menus, setMenus] = useState([]);
  const [name, setName] = useState("");
  const [layout, setLayout] = useState("1x1");
  const [actions, setActions] = useState([]);
  const [file, setFile] = useState(null);

  const fetchMenus = async () => setMenus((await api.get("/richmenus")).data);
  useEffect(() => { fetchMenus(); }, []);

  const handleUpload = async () => {
    if (!file) return alert("เลือกรูปก่อน");
    const formData = new FormData();
    formData.append("name", name);
    formData.append("layout", layout);
    formData.append("actions", JSON.stringify(actions));
    formData.append("image", file);
    await api.post("/richmenus", formData);
    fetchMenus();
    setName(""); setLayout("1x1"); setActions([]); setFile(null);
  };

  const handleDelete = async (id) => { await api.delete(`/richmenus/${id}`); fetchMenus(); };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-2xl">Rich Menu Management</h1>
        <a href="/assign" className="bg-blue-600 text-white px-4 py-2 rounded">Assign Menu</a>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <input placeholder="ชื่อเมนู" value={name} onChange={e=>setName(e.target.value)} className="border p-2" />
        <select value={layout} onChange={e=>setLayout(e.target.value)} className="border p-2">
          <option value="1x1">1x1</option>
          <option value="2x1">2x1</option>
          <option value="3x2">3x2</option>
        </select>
        <input type="file" onChange={e=>setFile(e.target.files[0])} className="p-2" />
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleUpload}>Upload</button>
      </div>
      <RichMenuBuilder image={file ? URL.createObjectURL(file) : ""} layout={layout} actions={actions} setActions={setActions} />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {menus.map(m => (
          <div key={m.id} className="border p-3 rounded shadow">
            <img src={`http://localhost:5000/${m.image_path}`} className="w-full mb-2" alt={m.name}/>
            <div className="font-bold">{m.name}</div>
            <button className="mt-2 text-red-500" onClick={() => handleDelete(m.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
