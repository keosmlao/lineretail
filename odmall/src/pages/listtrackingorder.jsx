import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BillDetailPage() {
  const { bill_no } = useParams();
  const [bill, setBill] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/bills/${bill_no}`);
        setBill(res.data.data);
      } catch (err) {
        console.error("❌ Error fetching bill detail:", err);
        setError("ບໍ່ພົບຂໍ້ມູນ");
      }
    };
    fetchBill();
  }, [bill_no]);

  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!bill) return <p className="p-4">🔄 ກຳລັງໂຫຼດ...</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-black"
      >
        <ArrowLeft className="w-4 h-4" />
        ກັບຄືນ
      </button>

      <h2 className="text-xl font-bold mb-2">ລາຍລະອຽດບິນ</h2>
      <p className="text-gray-600">ເລກບິນ: {bill.bill_no}</p>
      <p className="text-gray-600">ວັນທີ: {bill.date}</p>

      <div className="mt-4 border-t pt-2">
        {bill.items.map((item, idx) => (
          <div key={idx} className="flex justify-between py-1 text-gray-800 text-sm">
            <span>{item.name} × {item.qty}</span>
            <span>{(item.price * item.qty).toLocaleString()} ₭</span>
          </div>
        ))}
      </div>

      <div className="text-right mt-4 font-bold text-lg text-green-700">
        ລວມທັງໝົດ: {bill.total_amount.toLocaleString()} ₭
      </div>
    </div>
  );
}
