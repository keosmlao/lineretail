import { useEffect, useState } from "react";
import axios from "axios";
import BottomNav from "../components/BottomNav";

import api from "../service/api";

export default function PointReadeem() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const res = await api.get("/promotion-points");
        setProducts(res.data.data || []);
      } catch (err) {
        console.error("❌ Error fetching promotion points:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, []);

  return (
    <>
      <div className="min-h-screen pt-10 pb-20 px-4">
        <h2 className="text-xl font-bold mb-4 text-center">🎁 ລາຍການສິນຄ້າແລກຄະແນນ</h2>

        {loading ? (
          <div className="text-center text-gray-500">🔄 ກຳລັງໂຫຼດ...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((item) => (
              <div key={item.ic_code} className="border rounded-xl p-3 shadow-sm hover:shadow-md transition">
                <img
                  src={item.url_image || "/no-image.png"}
                  alt={item.name_1}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{item.name_1}</h3>
                <p className="text-sm text-gray-500 mt-1">ໃຊ້ {item.point_promotion} ຄະແນນ</p>
                <p className="text-xs text-indigo-500 mt-1">{item.card_type?.toUpperCase()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </>
  );
}
