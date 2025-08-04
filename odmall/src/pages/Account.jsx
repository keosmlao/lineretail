import BottomNav from "../components/BottomNav";
import {
  User, Mail, Phone, MapPin, Calendar, Settings, LogOut,
  Camera, Heart, Star, Gift, CreditCard, ChevronRight,
  Award, Zap,
  Train,
  ListOrdered,
  ScanLineIcon,
  PointerIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Account() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setProfile(JSON.parse(user));
  }, []);

  const stats = [
    { icon: Heart, label: "Favorites", value: "0", color: "text-pink-500" },
    { icon: Star, label: "Reviews", value: "0", color: "text-yellow-500" },
    { icon: Gift, label: "Rewards", value: "0", color: "text-purple-500" },
  ];

  const menuItems = [
    { icon: ListOrdered, label: "ປະຫວັດການສັ່ງຊື້", subtitle: "ລາຍການສັງຊື້ຜ່ານມາ", Link: "/salehistory" },
    { icon: Train, label: "ຕິດຕາມການຈັດສົ່ງ", subtitle: "Customize your experience",Link: "/trackingorder" },
    { icon: Settings, label: "ບໍລິການຫຼັງການຂາຍ", subtitle: "View saved items",link :""},
    { icon: PointerIcon, label: "ປະຫວັດການຮັບຄະແນນ", subtitle: "Manage payment methods" ,link:""},
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-900 pb-20">
        <div className="relative">
          <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 h-48"></div>

          {profile && (
            <div className="absolute inset-x-0 top-16 px-6">
              <div className="bg-gray-800 rounded-3xl shadow-2xl p-6 border border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={profile.pictureUrl}
                        alt="Profile"
                        className="w-20 h-20 rounded-2xl border-3 border-gray-700"
                      />
                      <button className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg shadow-lg">
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    <div>
                      <h2 className="text-white text-xl font-bold">{profile.displayName ?? "Guest"}</h2>
                      <p className="text-gray-400 text-sm">{profile.displayName ?? ""}</p>
                      <div className="flex items-center mt-2">
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-xs font-semibold px-3 py-1 rounded-full text-gray-900">
                          {profile.displayName}
                        </span>
                        <span className="text-gray-400 text-xs ml-3">
                          {profile.points ?? 0} ຄະແນນ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className={`${stat.color} mb-1`}>
                        <stat.icon className="w-5 h-5 mx-auto" />
                      </div>
                      <p className="text-white text-lg font-semibold">{stat.value}</p>
                      <p className="text-gray-500 text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-36 px-6">
          <h3 className="text-gray-400 text-sm font-semibold mb-4">ACCOUNT</h3>
          <div className="space-y-3">
            {menuItems.map((item, index) => {
              const content = (
                <div className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-700 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-700 p-2 rounded-xl">
                      <item.icon className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-gray-500 text-xs">{item.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </div>
              );
              return item.Link ? (
                <Link to={item.Link} key={index}>{content}</Link>
              ) : (
                <button key={index} className="w-full">{content}</button>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav />
    </>
  );
}