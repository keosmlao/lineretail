import { useRef, useState } from "react";
import Draggable from "react-draggable";

const RICH_MENU_SIZE = { width: 2500, height: 843 }; // 3x2 ปรับ height

export default function RichMenuBuilder({ image, layout, actions, setActions }) {
  const ref = useRef();
  const [selected, setSelected] = useState(null);
  const heightPx = layout === "3x2" ? 340 : 170;

  const handleAdd = () => {
    setActions([...actions, { x: 0, y: 0, width: 600, height: 400, type: "message", value: "" }]);
  };

  const handleDrag = (idx, e, data) => {
    const n = [...actions];
    n[idx].x = Math.round((data.x / 500) * RICH_MENU_SIZE.width);
    n[idx].y = Math.round((data.y / heightPx) * RICH_MENU_SIZE.height);
    setActions(n);
  };

  const handleResize = (idx, dir) => {
    const n = [...actions];
    if (dir === "w") n[idx].width += 50;
    if (dir === "h") n[idx].height += 50;
    setActions(n);
  };

  return (
    <div>
      <button onClick={handleAdd} className="mb-2 bg-green-500 text-white rounded px-3 py-1">+ เพิ่มปุ่ม</button>
      <div ref={ref} className="relative border" style={{ width: 500, height: heightPx, background: "#f7fafc" }}>
        {image && <img src={image} alt="" className="absolute inset-0 w-full h-full object-contain" />}
        {actions.map((a, i) => (
          <Draggable
            key={i}
            position={{
              x: (a.x / RICH_MENU_SIZE.width) * 500,
              y: (a.y / RICH_MENU_SIZE.height) * heightPx,
            }}
            onDrag={(e, data) => handleDrag(i, e, data)}
            bounds="parent"
          >
            <div
              onClick={() => setSelected(i)}
              className={`absolute border-2 ${selected === i ? "border-blue-500" : "border-red-500"} bg-blue-200 bg-opacity-30`}
              style={{
                width: (a.width / RICH_MENU_SIZE.width) * 500,
                height: (a.height / RICH_MENU_SIZE.height) * heightPx,
                cursor: "move"
              }}
            >
              <span className="text-xs">{a.type}</span>
              <button
                className="absolute bottom-1 right-1 bg-white px-1 rounded text-xs"
                onClick={e => { e.stopPropagation(); handleResize(i, "w"); }}
              >↔️</button>
              <button
                className="absolute bottom-1 left-1 bg-white px-1 rounded text-xs"
                onClick={e => { e.stopPropagation(); handleResize(i, "h"); }}
              >↕️</button>
            </div>
          </Draggable>
        ))}
      </div>
      {selected !== null && (
        <div className="p-2 mt-2 bg-gray-50 rounded shadow">
          <label>ประเภท: </label>
          <select
            value={actions[selected].type}
            onChange={e => {
              const n = [...actions];
              n[selected].type = e.target.value;
              setActions(n);
            }}
          >
            <option value="message">message</option>
            <option value="uri">uri</option>
          </select>
          <input
            className="border ml-2"
            value={actions[selected].value}
            placeholder="ข้อความหรือ url"
            onChange={e => {
              const n = [...actions];
              n[selected].value = e.target.value;
              setActions(n);
            }}
          />
          <button className="ml-2 text-red-500" onClick={() => {
            setActions(actions.filter((_, idx) => idx !== selected));
            setSelected(null);
          }}>ลบปุ่ม</button>
        </div>
      )}
    </div>
  );
}
