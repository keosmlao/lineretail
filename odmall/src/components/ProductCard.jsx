import { useState } from "react";
import { ShoppingCart, Package, Star, Sparkles } from "lucide-react";

// Helper
function calculatePoint(value) {
  const pointRate = 50000;
  return Math.floor(value / pointRate);
}

export default function ProductCard({ product, onAddCart, index, discountPercent }) {
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imgErrorCount, setImgErrorCount] = useState(0);

  const priceAfter =
    discountPercent > 0
      ? Math.round(product.sale_price * (1 - discountPercent / 100))
      : product.sale_price;

  const discountAmount = product.sale_price - priceAfter;
  const earnPoint = product.have_point === 1 ? calculatePoint(priceAfter) : 0;

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      onAddCart({
        ...product,
        discount_amount: discountAmount,
        price_after_discount: priceAfter,
        earn_point: earnPoint,
      });
      setIsAdding(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);
    }, 600);
  };

  const getImageSrc = () => {
    if (!product.url_image) return null;
    if (imgErrorCount === 0) {
      return `https://www.odienmall.com/static/image/product/${product.url_image}`;
    } else if (imgErrorCount === 1) {
      return "/fallback-image.png";
    }
    return null;
  };

  const handleImageError = () => setImgErrorCount((prev) => prev + 1);

  return (
    <div
      className="relative bg-white/80 backdrop-blur-md rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group animate-fadeInUp"
      style={{ animationDelay: `${index * 50}ms`, minHeight: 270 }}
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="absolute top-2 right-2 z-30">
          <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full text-xs shadow border border-green-200 animate-bounce">
            -{discountPercent}%
          </span>
        </div>
      )}

      {/* Hot Item Badge */}
      {product.is_popular && (
        <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
          <Star size={12} fill="white" />
          <span className="font-medium">ຂາຍດີ</span>
        </div>
      )}

      {/* Point Badge */}
      {product.have_point === 1 && earnPoint > 0 && (
        <div className="absolute top-3 left-3 mt-6 z-20 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow">
          <Sparkles size={12} />
          <span>+{earnPoint} ແຕ້ມ</span>
        </div>
      )}

      <div className="p-5 flex flex-col h-full">
        {/* Image */}
        <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 mb-4 group-hover:scale-105 transition-transform duration-500">
          {getImageSrc() ? (
            <img
              src={getImageSrc()}
              alt={product.ic_name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={handleImageError}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="w-16 h-16 text-gray-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-white text-sm font-medium">ເບິ່ງລາຍລະອຽດ</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col">
          <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-purple-700 transition-colors duration-300">
            {product.ic_name}
          </h3>

          {discountPercent > 0 && (
            <span className="text-xs font-bold text-red-600 line-through opacity-60">
              {product.sale_price.toLocaleString()}
            </span>
          )}

          <div className="mt-auto flex items-end gap-2">
            <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {priceAfter.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">ກີບ</span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`w-full mt-3 py-2 rounded-2xl font-medium transition-all duration-300 transform ${
              isAdding
                ? "bg-gray-200 scale-95"
                : showSuccess
                ? "bg-green-500 text-white"
                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-[1.02] shadow-lg hover:shadow-xl"
            }`}
          >
            {isAdding ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ກຳລັງເພີ່ມ...
              </span>
            ) : showSuccess ? (
              <span className="flex items-center justify-center gap-2">
                ✓ ເພີ່ມແລ້ວ
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ShoppingCart size={16} />
                ເພີ່ມໃສ່ກະຕ່າ
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Ping Animation */}
      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 bg-green-400 rounded-full animate-ping opacity-20"></div>
        </div>
      )}
    </div>
  );
}
