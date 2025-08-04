import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import Shop from "./pages/Shop";         // <-- ต้อง import
import Account from "./pages/Account";   // <-- ต้อง import
import Cart from "./pages/Cart";         // <-- ต้อง import
import Payment from "./pages/Payment";
import SaleHistory from "./pages/salehistory"; // <-- ต้อง import
import Promotion from "./pages/promotion"; // <-- ต้อง import
import TrackinngOrder from "./pages/trackingorder"; // <-- ต้อง import
import PointReadeem from "./pages/poinredeem";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>}/>
        <Route path="/shop"element={ <ProtectedRoute> <Shop /></ProtectedRoute>}/>
        <Route path="/cart" element={<Cart />} />
        <Route path="/salehistory" element={<SaleHistory />} />
        <Route path="/trackingorder" element={<TrackinngOrder />} />
        <Route path="/promotion" element={<Promotion />} />
        <Route path="/point" element={<PointReadeem />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>}
        />
      </Routes>
           <ToastContainer position="bottom-center" />
    </BrowserRouter>
  );
}

export default App;
