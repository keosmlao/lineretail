import { useEffect, useState } from "react";
import api from "../service/api";

export default function SaleHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [profile, setProfile] = useState(null);

useEffect(() => {
  const user = localStorage.getItem("user");
  if (user) setProfile(JSON.parse(user));
}, []);

// ดึงประวัติการสั่งซื้อเมื่อ profile มีข้อมูลแล้ว
useEffect(() => {
  const fetchHistory = async () => {
    if (!profile?.usercode) return; // ป้องกันกรณี profile ยังไม่พร้อม
    try {
      const res = await api.get("/salehistory?usercode=" + profile.usercode);
      setHistory(res.data.data);
    } catch (err) {
      console.error("❌ Error loading history:", err);
      setError("ດຶງຂໍ້ມູນຜິດພາດ - ກະລຸນາລອງໃໝ່ອີກຄັ້ງ");
    } finally {
      setLoading(false);
    }
  };

  fetchHistory();
}, [profile]);

  const retryFetch = () => {
    setError("");
    setLoading(true);
    
    const fetchHistory = async () => {
          if (!profile?.usercode) return; // ป้องกันกรณี profile ยังไม่พร้อม
      try {
      const res = await api.get("/salehistory?usercode=" + profile.usercode);
        setHistory(res.data.data);
      } catch (err) {
        console.error("❌ Error loading history:", err);
        setError("ດຶງຂໍ້ມູນຜິດພາດ - ກະລຸນາລອງໃໝ່ອີກຄັ້ງ");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  };

  const handleReceiveOrder = async (orderId, docNo) => {
    // Confirmation dialog
    const confirmed = window.confirm(
      `ທ່ານແນ່ໃຈວ່າໄດ້ຮັບສິນຄ້າແລ້ວບໍ?\n\nເລກທີ່ຄຳສັ່ງ: ${docNo}\n\nການດຳເນີນການນີ້ບໍ່ສາມາດຍົກເລີກໄດ້`
    );
    
    if (!confirmed) {
      return;
    }

    setUpdatingOrder(orderId);
    try {
      // API call to update order status to received
      await api.put(`/salehistory/${orderId}/receive`);
      
      // Update local state
      setHistory(prevHistory => 
        prevHistory.map(order => 
          order.doc_no === docNo 
            ? { ...order, status: "ຮັບເຄືອງແລ້ວ" }
            : order
        )
      );
      
      // Success confirmation
      alert("✅ ອັບເດດສະຖານະສຳເລັດ - ທ່ານໄດ້ຮັບສິນຄ້າແລ້ວ");
      
    } catch (err) {
      console.error("❌ Error updating order:", err);
      // Error message
      alert("❌ ເກີດຂໍ້ຜິດພາດ - ກະລຸນາລອງໃໝ່ອີກຄັ້ງ\n\nກະລຸນາຕິດຕໍ່ຝ່າຍສະໜັບສະໜູນຖ້າບັນຫາຍັງຄົງຢູ່");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filteredHistory = history.filter(order => {
    if (filter === "pending") return order.status === "ລໍຖ້າຊຳລະເງິນ";
    if (filter === "paid") return order.status === "ຊຳລະເງິນເເລ້ວ";
    if (filter === "received") return order.status === "ຮັບເຄືອງແລ້ວ";
    return true;
  });

  // Calculate totals excluding pending orders
  const paidOrders = history.filter(order => order.status !== "ລໍຖ້າຊຳລະເງິນ");
  const totalSpent = paidOrders.reduce((sum, order) => sum + Number(order.total_amount_2), 0);
  const totalPoints = paidOrders.reduce((sum, order) => sum + Number(order.sum_point), 0);
  
  // Calculate pending amount
  const pendingOrders = history.filter(order => order.status === "ລໍຖ້າຊຳລະເງິນ");
  const pendingAmount = pendingOrders.reduce((sum, order) => sum + Number(order.total_amount_2), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="w-12 h-12 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin mx-auto absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">ເກີດຂໍ້ຜິດພາດ</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={retryFetch}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            ລອງໃໝ່ອີກຄັ້ງ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <button
                onClick={() => window.history.back()}
                className="w-10 h-10 bg-white/60 hover:bg-white/80 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  ປະຫວັດການສັ່ງຊື້
                </h1>
                <p className="text-gray-600 mt-1">ລາຍການການສັ່ງຊື້ທັງໝົດຂອງທ່ານ</p>
              </div>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === "all" 
                    ? "bg-indigo-500 text-white shadow-lg transform scale-105" 
                    : "bg-white/60 text-gray-600 hover:bg-white/80"
                }`}
              >
                ທັງໝົດ
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === "pending" 
                    ? "bg-yellow-500 text-white shadow-lg transform scale-105" 
                    : "bg-white/60 text-gray-600 hover:bg-white/80"
                }`}
              >
                ລໍຖ້າຊຳລະ
              </button>
              <button
                onClick={() => setFilter("paid")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === "paid" 
                    ? "bg-green-500 text-white shadow-lg transform scale-105" 
                    : "bg-white/60 text-gray-600 hover:bg-white/80"
                }`}
              >
                ຊຳລະແລ້ວ
              </button>
              <button
                onClick={() => setFilter("received")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === "received" 
                    ? "bg-blue-500 text-white shadow-lg transform scale-105" 
                    : "bg-white/60 text-gray-600 hover:bg-white/80"
                }`}
              >
                ຮັບເຄືອງແລ້ວ
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        {history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ລາຍການທັງໝົດ</p>
                  <p className="text-2xl font-bold text-gray-800">{history.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ໃຊ້ຈ່າຍແລ້ວ</p>
                  <p className="text-2xl font-bold text-gray-800">{totalSpent.toLocaleString()} ກີບ</p>
                  <p className="text-xs text-gray-500 mt-1">*ລວມເຉພາະທີ່ຊຳລະແລ້ວ</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ແຕ້ມທັງໝົດ</p>
                  <p className="text-2xl font-bold text-gray-800">{totalPoints.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Pending Amount Card */}
            {pendingAmount > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ລໍຖ້າຊຳລະ</p>
                    <p className="text-2xl font-bold text-red-600">{pendingAmount.toLocaleString()} ກີບ</p>
                    <p className="text-xs text-gray-500 mt-1">{pendingOrders.length} ລາຍການ</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders List */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">ບໍ່ພົບລາຍການສັ່ງຊື້</h3>
            <p className="text-gray-500">ເລີ່ມຊື້ເຂົ້າສິນຄ້າເພື່ອເບິ່ງປະຫວັດການສັ່ງຊື້</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredHistory.map((order, index) => (
              <div 
                key={order.doc_no} 
                className="group bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideInUp 0.6s ease-out forwards'
                }}
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6 border-b border-white/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{order.doc_no}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.doc_date).toLocaleDateString('lo-LA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'long'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg ${
                        order.status === "ຮັບເຄືອງແລ້ວ"
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                          : order.status === "ຊຳລະເງິນເເລ້ວ"
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                      }`}>
                        {order.status === "ຮັບເຄືອງແລ້ວ" 
                          ? "📦 ຮັບເຄືອງແລ້ວ" 
                          : order.status === "ຊຳລະເງິນເເລ້ວ" 
                          ? "✓ ຊຳລະແລ້ວ" 
                          : "⏳ ລໍຖ້າຊຳລະ"}
                      </span>

                      {/* Receive Order Button - Only show for paid orders */}
                      {order.status === "ຊຳລະເງິນເເລ້ວ" && (
                        <button
                          onClick={() => handleReceiveOrder(order.id, order.doc_no)}
                          disabled={updatingOrder === order.id}
                          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg flex items-center gap-2 ${
                            updatingOrder === order.id
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 hover:scale-105"
                          }`}
                        >
                          {updatingOrder === order.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ກຳລັງອັບເດດ...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              ຮັບເຄືອງ
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    ລາຍການສິນຄ້າ ({order.bill_detail.length} ລາຍການ)
                  </h4>
                  
                  <div className="space-y-3">
                    {order.bill_detail.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white/40 rounded-xl border border-white/30">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{item.item_name}</p>
                            <p className="text-sm text-gray-600">
                              {item.qty} ໜ່ວຍ × {Number(item.price).toLocaleString()} ກີບ
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">
                            {Number(item.sum_amount).toLocaleString()} ກີບ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-r from-gray-50/50 to-blue-50/50 p-6 border-t border-white/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">ລວມທັງໝົດ</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {Number(order.total_amount_2).toLocaleString()} ກີບ
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">ແຕ້ມທີ່ໄດ້</p>
                        <p className="text-xl font-bold text-yellow-600">
                          +{order.sum_point} ແຕ້ມ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}