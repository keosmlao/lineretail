import {
  Trash2, Plus, Minus, ArrowLeft,
  ShoppingCart, Package, Sparkles
} from "lucide-react";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setQty, removeCart, clearCart } from "../store/cartSlice";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function Cart() {
  const cart = useSelector(state => state.cart.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);
  const [updatingQty, setUpdatingQty] = useState(null);

  const total = cart.reduce((sum, item) => {
    const priceAfter = item.price_after_discount ?? item.sale_price;
    return sum + (priceAfter * item.qty);
  }, 0);

  const totalPoints = cart.reduce((sum, item) => {
    const priceAfter = item.price_after_discount ?? item.sale_price;
    if (!item.have_point) return sum;
    return sum + Math.floor((priceAfter * item.qty) / 50000);
  }, 0);

  const updateQty = (ic_code, newQty) => {
    if (newQty < 1) return;
    setUpdatingQty(ic_code);
    setTimeout(() => {
      dispatch(setQty({ ic_code, qty: newQty }));
      setUpdatingQty(null);
    }, 300);
  };

  const removeItem = (ic_code) => {
    setRemovingItem(ic_code);
    setTimeout(() => {
      dispatch(removeCart(ic_code));
      setRemovingItem(null);
    }, 300);
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    setShowConfirm(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
        <div className="relative max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              className="mr-4 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <ShoppingCart className="text-indigo-600" /> ກະຕ່າສິນຄ້າ
            </h1>
          </div>

          {/* Cart Content */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 mb-32">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">ຍັງບໍ່ມີສິນຄ້າໃນກະຕ່າ</p>
                <button
                  className="mt-4 text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                  onClick={() => navigate("/")}
                >
                  ເລີ່ມຊື້ສິນຄ້າ →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => {
                  const priceBefore = item.price_before || item.sale_price;
                  const priceAfter = item.price_after_discount ?? item.sale_price;
                  const discount = priceBefore - priceAfter;
                  const itemPoint = item.have_point
                    ? Math.floor((priceAfter * item.qty) / 50000)
                    : 0;

                  return (
                    <div key={item.ic_code} className="relative bg-white rounded-2xl p-4 shadow-sm transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                          <Package className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-sm">{item.ic_name}</h3>
                          <div className="text-xs text-gray-500 line-through">{priceBefore.toLocaleString()} ກີບ</div>
                          <div className="text-sm font-bold text-indigo-600">{priceAfter.toLocaleString()} ກີບ</div>
                          {discount > 0 && (
                            <div className="text-xs text-pink-500">
                              ສ່ວນຫຼຸດ {discount.toLocaleString()} ກີບ
                            </div>
                          )}
                          {itemPoint > 0 && (
                            <div className="text-xs text-yellow-600 font-medium mt-1 flex items-center gap-1">
                              <Sparkles className="w-4 h-4 text-yellow-500" />
                              ສະສົມ {itemPoint} ແຕ້ມ
                            </div>
                          )}
                        </div>
                        <div className="flex items-center bg-gray-100 rounded-full p-1">
                          <button onClick={() => updateQty(item.ic_code, item.qty - 1)} disabled={item.qty <= 1} className="p-1 bg-white text-gray-700 hover:bg-indigo-500 hover:text-white rounded-full">
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center font-bold text-sm">{item.qty}</span>
                          <button onClick={() => updateQty(item.ic_code, item.qty + 1)} className="p-1 bg-white text-gray-700 hover:bg-indigo-500 hover:text-white rounded-full">
                            <Plus size={12} />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.ic_code)} className="p-1 text-red-500 hover:bg-red-50 rounded-full">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-sm">
                        <span className="text-gray-500">ລວມ</span>
                        <span className="font-semibold">{(priceAfter * item.qty).toLocaleString()} ກີບ</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Summary */}
          <div className="fixed bottom-20 left-0 right-0 bg-white/90 backdrop-blur-lg border-t shadow-2xl">
            <div className="max-w-2xl mx-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">ລວມທັງໝົດ</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {total.toLocaleString("th-TH")} ກີບ
                  </p>
                  {totalPoints > 0 && (
                    <p className="text-sm text-yellow-600 font-medium flex items-center gap-1 mt-1">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      ໄດ້ຮັບ {totalPoints.toLocaleString()} ແຕ້ມສະສົມ
                    </p>
                  )}
                </div>
                {cart.length > 0 && (
                  <button onClick={() => setShowConfirm(true)} className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg">
                    <Trash2 size={18} /> <span>ລ້າງກະຕ່າ</span>
                  </button>
                )}
              </div>
              <button
                disabled={cart.length === 0}
                onClick={() => navigate("/payment")}
                className={`w-full py-4 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-2 ${cart.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02]'}`}
              >
                <Sparkles className="w-5 h-5" /> ດຳເນີນການສັ່ງຊື້
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Confirm Clear Cart */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-2">ລ້າງກະຕ່າ?</h2>
            <p className="text-sm text-gray-500 mb-4">ທ່ານຈະລຶບທຸກລາຍການໃນກະຕ່າ ຢ່າງແນ່ນອນບໍ?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleClearCart}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                ລ້າງກະຕ່າ
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="cart" cartQty={cart.length} />
    </>
  );
}
