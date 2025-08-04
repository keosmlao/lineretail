import { Home, ShoppingCart, User, PartyPopper, Package, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/cart")) setActiveTab("cart");
    else if (path.startsWith("/account")) setActiveTab("account");
        else if (path.startsWith("/point")) setActiveTab("point");
    else setActiveTab("home");
  }, [location.pathname]);
  // ใช้ redux cart
  const cart = useSelector(state => state.cart.cart);
  const cartQty = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleNavigation = (tab) => {
    if (tab !== activeTab) {
      setIsAnimating(true);
      setActiveTab(tab);
      setTimeout(() => setIsAnimating(false), 300);

      if (tab === "home") navigate("/");
      else if (tab === "cart") navigate("/cart");
      else if (tab === "point") navigate("/point");
      else if (tab === "account") navigate("/account");
    }
  };

  const navItems = [
    {
      id: "home",
      icon: Home,
      label: "ໜ້າຫຼັກ",
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-50"
    },

    {
      id: "cart",
      icon: ShoppingCart,
      label: "ກະຕ່າ",
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-50",
      badge: cartQty
    },
        {
      id: "point",
      icon: PartyPopper,
      label: "ຂອງລາງວັນ",
      color: "from-yellow-400 to-pink-500",
      bgColor: "bg-yellow-50"
    },
    {
      id: "account",
      icon: User,
      label: "ບັນຊີ",
      color: "from-pink-400 to-pink-600",
      bgColor: "bg-pink-50"
    }
  ];


  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-white/70 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl">
          <div className="relative">
            <div
              className={`absolute top-0 h-1 bg-gradient-to-r ${navItems.find(item => item.id === activeTab)?.color
                } transition-all duration-500 ease-out`}
              style={{
                width: `${100 / navItems.length}%`,
                left: `${navItems.findIndex(item => item.id === activeTab) * (100 / navItems.length)}%`
              }}
            />

            <div className="flex justify-around items-center px-4 py-2">
              {navItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`relative flex flex-col items-center py-2 px-6 rounded-2xl transition-all duration-300 ${activeTab === item.id ? item.bgColor : ""
                    }`}
                  style={{
                    animation: isAnimating && activeTab === item.id
                      ? "popIn 0.3s ease-out"
                      : ""
                  }}
                >
                  <div className={`relative transition-all duration-300 ${activeTab === item.id
                    ? "transform scale-110"
                    : "transform scale-100"
                    }`}>
                    <item.icon
                      size={24}
                      className={`transition-colors duration-300 ${activeTab === item.id
                        ? "text-transparent bg-gradient-to-r bg-clip-text"
                        : "text-gray-400"
                        }`}
                      style={{
                        fill: activeTab === item.id ? "url(#gradient)" : "none",
                        stroke: activeTab === item.id ? "url(#gradient)" : "currentColor"
                      }}
                    />

                    {/* Active indicator sparkle */}
                    {activeTab === item.id && (
                      <Sparkles
                        size={12}
                        className="absolute -top-1 -right-1 text-yellow-400 animate-pulse"
                      />
                    )}

                    {/* Cart badge */}
                    {item.badge && item.badge > 0 && (
                      <span className={`absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center px-1 rounded-full text-[11px] font-bold text-white shadow-lg ${activeTab === item.id
                        ? "bg-gradient-to-r from-red-500 to-pink-500 animate-bounce"
                        : "bg-red-500"
                        }`}>
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </div>

                  <span className={`text-xs mt-1 font-medium transition-all duration-300 ${activeTab === item.id
                    ? `text-transparent bg-gradient-to-r ${item.color} bg-clip-text`
                    : "text-gray-400"
                    }`}>
                    {item.label}
                  </span>

                  {activeTab === item.id && (
                    <span
                      className="absolute inset-0 rounded-2xl animate-ripple"
                      style={{
                        background: `radial-gradient(circle, ${item.bgColor.replace('bg-', '').replace('-50', '-200')
                          } 0%, transparent 70%)`
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Floating action hint */}
        {cartQty > 0 && activeTab !== "cart" && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-float flex items-center gap-2">
              <Package size={16} />
              <span>{cartQty} ສິນຄ້າໃນກະຕ່າ</span>
            </div>
          </div>
        )}
      </nav>

      {/* SVG Gradient Definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      <style jsx>{`
        @keyframes popIn {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.5;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(-5px);
          }
        }

        .animate-ripple {
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        }

        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default BottomNav;
