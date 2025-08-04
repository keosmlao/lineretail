import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import debounce from "lodash.debounce";
import { ShoppingCart, Search, Filter, Sparkles } from "lucide-react";
import { addCart } from "../store/cartSlice";
import ProductCard from "./ProductCard";
import { toast } from "react-toastify";
import api from "../service/api";

function getDiscountPercent(profile) {
  if (!profile?.discount) return 0;
  if (typeof profile.discount === "string") {
    return Number(profile.discount.replace(/[^\d.]/g, "")) || 0;
  } else if (typeof profile.discount === "number") {
    return profile.discount;
  }
  return 0;
}

function calculatePoint(value) {
  const pointRate = 50000;
  return Math.floor(value / pointRate);
}

export default function ProductList() {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.cart); // ✅ ใช้ Redux cart

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [discountPercent, setDiscountPercent] = useState(0);
  const limit = 20;

  useEffect(() => {
    try {
      const profile = JSON.parse(localStorage.getItem("user"));
      setDiscountPercent(getDiscountPercent(profile));
    } catch {
      setDiscountPercent(0);
    }
  }, []);

  const loadProducts = useCallback(async (p = 1, q = "") => {
    setLoading(true);
    try {
      const res = await api.get("/product", {
        params: { page: p, limit, q },
      });
      const newList = res.data.list || [];
      if (p === 1) setProducts(newList);
      else setProducts((prev) => [...prev, ...newList]);
      setHasMore(newList.length === limit);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((val) => {
      setPage(1);
      loadProducts(1, val);
    }, 400),
    [loadProducts]
  );

  useEffect(() => {
    debouncedSearch(search);
  }, [search, debouncedSearch]);

  useEffect(() => {
    if (page > 1) loadProducts(page, search);
  }, [page, search, loadProducts]);

  useEffect(() => {
    if (loading || !hasMore) return;
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const nearBottom =
          window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300;
        if (nearBottom && !loading && hasMore)
          setPage((prev) => prev + 1);
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  const handleAddCart = (product) => {
    const discountAmount = product.sale_price * (discountPercent / 100);
    const priceAfter = Math.round(product.sale_price - discountAmount);
    const earnPoint = product.have_point === 1 ? calculatePoint(priceAfter) : 0;

    const existingItem = cart.find((item) => item.ic_code === product.ic_code);
    const currentQty = existingItem?.qty || 0;
    const maxQty = product.balance_qty || 0;

    if (currentQty + 1 > maxQty) {
      toast.error("❌ ຈຳນວນໃນສາງບໍ່ພຽງພໍ");
      return;
    }

    dispatch(addCart({
      ...product,
      discount_amount: discountAmount,
      price_after_discount: priceAfter,
      earn_point: earnPoint,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* BG Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 -right-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="text-purple-600" />
              ສິນຄ້າທັງໝົດ
            </h1>
            <button className="p-2 bg-purple-100 rounded-full text-purple-600 hover:bg-purple-200 transition-colors">
              <Filter size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 placeholder-gray-400"
              placeholder="ຄົ້ນຫາສິນຄ້າ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="relative p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.ic_code}
              product={product}
              onAddCart={handleAddCart}
              index={index}
              discountPercent={discountPercent}
            />
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce animation-delay-200"></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce animation-delay-400"></div>
            </div>
          </div>
        )}

        {/* End */}
        {!hasMore && !loading && (
          <div className="flex justify-center items-center text-gray-400 py-8">
            --- ສິ້ນສຸດ ---
          </div>
        )}
      </div>

      {/* Animation CSS */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
