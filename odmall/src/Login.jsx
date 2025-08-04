import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import liff from "@line/liff";
import api from "./service/api";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const liffId = import.meta.env.VITE_LIFF_ID;

    if (!liffId) {
      console.error("❌ VITE_LIFF_ID not found. Please check your .env file.");
      return;
    }

    const doLogin = async () => {
      console
      try {
        await liff.init({ liffId });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const decoded = liff.getDecodedIDToken();
        const prof = await liff.getProfile();

        const res = await api.post("/liff/login", {
          user_id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
        });

        localStorage.setItem(
          "user",
          JSON.stringify({
            displayName: prof.displayName,
            pictureUrl: prof.pictureUrl,
            email: decoded.email,
            usercode: res.data.data.code,
            username: res.data.data.name_1,
            points: res.data.data.point_balance ?? 0,
            level: res.data.data.level ?? "member",
            discount: res.data.data.discount ?? "0 %",
            name_member: res.data.data.name_member ?? "member",
          })
        );

        navigate("/home");
      } catch (error) {
        console.error("❌ Error during LIFF login:", error);
        toast.error("Login failed. Please try again.");
      }
    };

    doLogin();
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <h1 className="text-2xl mb-2">Loading LINE Login...</h1>
      <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
    </div>
  );
}

export default Login;
