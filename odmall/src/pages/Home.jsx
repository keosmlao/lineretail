import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import liff from "@line/liff";
import api from "../service/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import ProductList from "../components/ProductList";

function Home() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  // Load user profile from localStorage
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setProfile(JSON.parse(user));
  }, []);

  // Load product list from API
  // useEffect(() => {
  //   api.get("/products")
  //     .then((res) => {
  //       setItems(res.data.list || []);
  //     })
  //     .catch((err) => {
  //       console.error("❌ Error loading products:", err);
  //       setItems([]);
  //     })
  //     .finally(() => setLoading(false));
  // }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    liff.logout();
    navigate("/");
  };

  if (!profile) return null;

  return (
<div className="bg-gray-100">
  <div className="sticky top-0 z-50 bg-white shadow-md">
    <Header />
  </div>
  <ProductList />
  <BottomNav />
</div>

  );
}

export default Home;
