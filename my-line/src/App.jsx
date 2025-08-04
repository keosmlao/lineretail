import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import liff from "@line/liff";
import api from "./api";
import Navbar from "./components/Navbar";

function App() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

useEffect(() => {
  const init = async () => {
    try {
      await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });

      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      const decoded = liff.getDecodedIDToken();
      const prof = await liff.getProfile();
      setProfile(prof);

      const res = await api.post("/api/liff/login", {
        user_id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      });

      const { group_id } = res.data;

      if (group_id === 1) navigate("/dashboard");
      else if (group_id === 2) navigate("/richmenus");
      else if (group_id === 3) navigate("/groups");
      else navigate("/unauthorized"); // 🚫 fallback for no group
    } catch (err) {
      console.error("❌ LIFF init/login error:", err);
      navigate("/unauthorized"); // 🚫 catch error fallback
    }
  };
  init();
}, []);


  return (
    <div>
      <Navbar profile={profile} />
      <div className="h-screen flex items-center justify-center text-xl font-bold">
        Logging in with LIFF...
      </div>
    </div>
  );
}

export default App;
