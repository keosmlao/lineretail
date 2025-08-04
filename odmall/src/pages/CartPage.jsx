// import { X, Minus, Plus } from "lucide-react";

// export default function CartPage({ cart, setCart }) {
//   // เพิ่มจำนวน
//   const incQty = (ic_code) => {
//     setCart((prev) =>
//       prev.map((item) =>
//         item.ic_code === ic_code ? { ...item, qty: item.qty + 1 } : item
//       )
//     );
//   };

//   // ลดจำนวน
//   const decQty = (ic_code) => {
//     setCart((prev) =>
//       prev
//         .map((item) =>
//           item.ic_code === ic_code ? { ...item, qty: Math.max(1, item.qty - 1) } : item
//         )
//         .filter((item) => item.qty > 0)
//     );
//   };

//   // ลบสินค้าออก
//   const remove = (ic_code) => {
//     setCart((prev) => prev.filter((item) => item.ic_code !== ic_code));
//   };

//   // ราคารวม
//   const total = cart.reduce((sum, item) => sum + Number(item.sale_price) * item.qty, 0);

//   if (!cart.length)
//     return (
//       <div className="flex flex-col items-center justify-center h-[70vh] text-gray-400">
//         <span className="text-7xl mb-2">🛒</span>
//         <div>ບໍ່ມີສິນຄ້າໃນກະຕ່າ</div>
//       </div>
//     );

//   return (
//     <div className="max-w-2xl mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold mb-6">🛒 ກະຕ່າສິນຄ້າ</h2>
//       <div className="divide-y border rounded-xl bg-white shadow">
//         {cart.map((item) => (
//           <div key={item.ic_code} className="flex items-center gap-3 py-3 px-2">
//             <img
//               src={item.url_image
//                 ? `https://www.odienmall.com/static/image/product/${item.url_image}`
//                 : "https://ui-avatars.com/api/?name=No+Image"}
//               alt={item.ic_name}
//               className="w-16 h-16 rounded-lg object-cover border"
//             />
//             <div className="flex-1 min-w-0">
//               <div className="font-medium text-gray-800 line-clamp-1">{item.ic_name}</div>
//               <div className="text-sm text-gray-500">{Number(item.sale_price).toLocaleString()} ກີບ</div>
//               <div className="flex items-center gap-2 mt-2">
//                 <button
//                   className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
//                   onClick={() => decQty(item.ic_code)}
//                 >
//                   <Minus size={16} />
//                 </button>
//                 <span className="min-w-[24px] text-center">{item.qty}</span>
//                 <button
//                   className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
//                   onClick={() => incQty(item.ic_code)}
//                 >
//                   <Plus size={16} />
//                 </button>
//               </div>
//             </div>
//             <div className="text-right min-w-[60px] font-semibold text-orange-500">
//               {(Number(item.sale_price) * item.qty).toLocaleString()}
//             </div>
//             <button
//               className="ml-2 p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition"
//               title="ลบออก"
//               onClick={() => remove(item.ic_code)}
//             >
//               <X size={18} />
//             </button>
//           </div>
//         ))}
//       </div>
//       {/* Total */}
//       <div className="flex justify-between items-center mt-6 text-lg font-bold">
//         <span>ລວມທັງໝົດ</span>
//         <span className="text-orange-600">{total.toLocaleString()} ກີບ</span>
//       </div>
//       {/* Checkout */}
//       <button
//         className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow transition"
//         onClick={() => alert("Coming soon!")}
//       >
//         ສັ່ງຊື້
//       </button>
//     </div>
//   );
// }
