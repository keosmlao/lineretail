import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../store/cartSlice";
import { useNavigate } from "react-router-dom";
import OnePayQR from "../components/OnePayQR";
import { v4 as uuidv4 } from 'uuid';
import {
  ArrowLeft, Truck, CreditCard, CheckCircle2, X,
} from "lucide-react";
import axios from "axios";
import api from "../service/api";

export default function Payment() {
  const cart = useSelector(state => state.cart.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [payment, setPayment] = useState("");
  const [delivery, setDelivery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedOptionAnim, setSelectedOptionAnim] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [orderId, setOrderId] = useState("");

  const total = cart.reduce((sum, item) => sum + (item.price_after_discount * item.qty), 0);
  const deliveryFee = delivery === "delivery" ? 5000 : 0;
  const grandTotal = total + deliveryFee;
  const isValid = cart.length > 0 && payment && delivery;

  const totalPoints = cart.reduce((sum, item) => {
    console.log("item", item);
    if (item.have_point === 1) {
      const point = item.earn_point ?? 0;
      return sum + (point * item.qty);
    }
    return sum;
  }, 0);

  function generateOrderId() {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    const shortUuid = uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase();

    return `ORD${yy}${MM}${dd}${shortUuid}`;
  }

  const orderid = async () => {
    try {
      const id = generateOrderId();
      setOrderId(id);
    } catch (err) {
      console.error('❌ Error loading docno:', err);
    }
  };

  useEffect(() => {
    orderid();

  }, []);

  const postOrder = async () => {
    const profile = JSON.parse(localStorage.getItem("user")) || {};
    const res = await api.post("/order", {
      items: cart,
      total_amount: grandTotal,
      delivery_type: delivery,
      payment_type: payment,
      status,
      customer: profile,
      orderId: orderId,
      total_point: totalPoints,
    });
    return res.data.orderId;
  };

  const handleOrder = async () => {
    setIsProcessing(true);

    try {
      if (payment === "qr") {
        setShowQR(true);
        console.log("🧾 QR Order created:", orderId);
      } else {
        const oid = await postOrder("paid");
        console.log("✅ Cash order paid:", oid, grandTotal);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          dispatch(clearCart());
          navigate("/");
        }, 2000);
      }
    } catch (err) {
      console.error("❌ Order error:", err);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQROrder = async () => {
    setShowQR(false);
    setIsProcessing(true);
    try {
      const profile = JSON.parse(localStorage.getItem("user")) || {};
      const res = await api.post("/order", {
        items: cart,
        total_amount: grandTotal,
        delivery_type: delivery,
        payment_type: payment,
        status,
        customer: profile,
        orderId: orderId,
        total_point: totalPoints,
      });

      if (res.status === 200 || res.data?.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          dispatch(clearCart());
          navigate("/");
        }, 2000);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error("❌ Payment failed:", err);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOptionSelect = (type, value) => {
    setSelectedOptionAnim(`${type}-${value}`);
    setTimeout(() => setSelectedOptionAnim(null), 300);
    if (type === "delivery") setDelivery(value);
    if (type === "payment") setPayment(value);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            className="mr-4 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ຊຳລະເງິນ
          </h1>
        </div>
      <div className="text-sm text-indigo-600 text-center mt-2">
        ແຕ້ມສະສົມ: <span className="font-bold">+{totalPoints.toLocaleString()}</span> ແຕ້ມ
      </div>
        {/* Total Card (Top) */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl py-8 px-6 mb-6 flex flex-col items-center justify-center">
          <div className="text-lg font-semibold text-gray-700 mb-2">ລວມທັງໝົດ</div>
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm mb-1">
            {grandTotal.toLocaleString()} <span className="text-2xl">ກີບ</span>
          </div>
          {delivery === "delivery" && (
            <div className="text-sm text-green-600 mt-2">
              ລວມຄ່າຈັດສົ່ງ +{deliveryFee.toLocaleString()} ກີບ
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Delivery Method */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="text-blue-600" />
              ວິທີຈັດສົ່ງ
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 transform hover:scale-105 ${delivery === "pickup"
                  ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg"
                  : "border-gray-200 hover:border-gray-300 bg-white"
                  } ${selectedOptionAnim === "delivery-pickup" ? "animate-pulse" : ""}`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value="pickup"
                  checked={delivery === "pickup"}
                  onChange={() => handleOptionSelect("delivery", "pickup")}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-3xl mb-2">🏪</div>
                  <div className="font-medium">ຮັບທີ່ຮ້ານ</div>
                  <div className="text-sm text-gray-500 mt-1">ບໍ່ມີຄ່າໃຊ້ຈ່າຍ</div>
                </div>
                {delivery === "pickup" && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-6 h-6 text-blue-500 animate-scaleIn" />
                  </div>
                )}
              </label>

              <label
                className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 transform hover:scale-105 ${delivery === "delivery"
                  ? "border-green-500 bg-gradient-to-r from-green-50 to-green-100 shadow-lg"
                  : "border-gray-200 hover:border-gray-300 bg-white"
                  } ${selectedOptionAnim === "delivery-delivery" ? "animate-pulse" : ""}`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value="delivery"
                  checked={delivery === "delivery"}
                  onChange={() => handleOptionSelect("delivery", "delivery")}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-3xl mb-2">🚚</div>
                  <div className="font-medium">ຈັດສົ່ງ</div>
                  <div className="text-sm text-gray-500 mt-1">+5,000 ກີບ</div>
                </div>
                {delivery === "delivery" && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-6 h-6 text-green-500 animate-scaleIn" />
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="text-purple-600" />
              ຊ່ອງທາງຊຳລະເງິນ
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 transform hover:scale-105 ${payment === "cash"
                  ? "border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 shadow-lg"
                  : "border-gray-200 hover:border-gray-300 bg-white"
                  } ${selectedOptionAnim === "payment-cash" ? "animate-pulse" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={payment === "cash"}
                  onChange={() => handleOptionSelect("payment", "cash")}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-3xl mb-2">💵</div>
                  <div className="font-medium">ເງິນສົດ</div>
                  <div className="text-sm text-gray-500 mt-1">ຈ່າຍທີ່ຮ້ານ</div>
                </div>
                {payment === "cash" && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-6 h-6 text-purple-500 animate-scaleIn" />
                  </div>
                )}
              </label>

              <label
                className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 transform hover:scale-105 ${payment === "qr"
                  ? "border-pink-500 bg-gradient-to-r from-pink-50 to-pink-100 shadow-lg"
                  : "border-gray-200 hover:border-gray-300 bg-white"
                  } ${selectedOptionAnim === "payment-qr" ? "animate-pulse" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="qr"
                  checked={payment === "qr"}
                  onChange={() => handleOptionSelect("payment", "qr")}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-3xl mb-2">📱</div>
                  <div className="font-medium">QR Code</div>
                  <div className="text-sm text-gray-500 mt-1">ໂອນຜ່ານ App</div>
                </div>
                {payment === "qr" && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-6 h-6 text-pink-500 animate-scaleIn" />
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleOrder}
            disabled={!isValid || isProcessing}
            className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 transform ${!isValid
              ? "bg-gray-300 cursor-not-allowed"
              : isProcessing
                ? "bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 shadow-lg hover:shadow-2xl"
              }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ກຳລັງດຳເນີນການ...
              </span>
            ) : (
              "ຢືນຢັນການສັ່ງຊື້"
            )}
          </button>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-xs w-full p-6 relative animate-scaleIn">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded-full"
              title="ปิด"
            >
              <X size={24} />
            </button>
            <h2 className="text-lg font-bold mb-4 text-center text-purple-600">ສະແກນ QR ສຳລັບຊຳລະຄ່າສິນຄ້າ</h2>
            <OnePayQR
              orderId={orderId}
              totalAmount={grandTotal}
              onPayment={handleQROrder}
            />
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"></div>
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-scaleIn">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">ສຳເລັດແລ້ວ! </h3>
              <p className="text-gray-600 mb-4">ຄຳສັ່ງຊື້ຂອງທ່ານໄດ້ຮັບການຢືນຢັນແລ້ວ</p>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {grandTotal.toLocaleString()} ກີບ
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
