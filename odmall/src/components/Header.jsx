import { useEffect, useState } from "react";

// Helper: style/label/ไอคอน ตามระดับสมาชิก
function getMemberLevelInfo(level = "member") {
  switch ((level || "member").toLowerCase()) {
    case "gold":
      return {
        label: "GOLD MEMBER",
        bg: "from-yellow-200 via-yellow-100 to-white",
        border: "border-yellow-400",
        text: "text-yellow-900",
        icon: "🥇",
      };
    case "platinum":
      return {
        label: "PLATINUM MEMBER",
        bg: "from-gray-100 via-white to-gray-200",
        border: "border-gray-400",
        text: "text-gray-700",
        icon: "💎",
      };
    case "black":
      return {
        label: "BLACK CARD",
        bg: "from-gray-900 via-gray-800 to-gray-700",
        border: "border-gray-700",
        text: "text-white",
        icon: "🖤",
      };
    default:
      return {
        label: "MEMBER",
        bg: "from-blue-100 via-white to-blue-50",
        border: "border-blue-300",
        text: "text-blue-700",
        icon: "👤",
      };
  }
}

export default function Header() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      if (user) setProfile(JSON.parse(user));
    } catch {
      setProfile(null);
    }
  }, []);

  if (!profile) return null;
  // fallback กรณีไม่มีข้อมูล
  const levelInfo = getMemberLevelInfo(profile.level);

  return (
    <header className="w-full flex justify-center py-1 px-1 sticky top-0 z-30 bg-transparent">
      <div
        className={`relative flex items-center gap-4 md:gap-6 px-3 md:px-8 py-4 md:py-5 rounded-2xl shadow-xl bg-gradient-to-r ${levelInfo.bg} border-4 ${levelInfo.border} ${levelInfo.text} w-full max-w-2xl mx-auto`}
        style={{ minHeight: 100 }}
      >
        {/* Decoration: Chip */}
        <div className="absolute left-4 top-4 w-10 h-6 bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-xl opacity-60 blur-[2px] -z-10"></div>
        {/* Profile Picture */}
        <img
          src={profile.pictureUrl || "/no-profile.png"}
          alt={profile.displayName || "User"}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white shadow-lg object-cover"
        />
        <div className="flex flex-col flex-1 min-w-0">
          {/* Member Name & Icon */}
          <div className="flex items-center gap-2 font-bold text-xl mb-1">
            <span className="text-2xl">{levelInfo.icon}</span>
            <span className="truncate text-xl md:text-2xl">{profile.displayName || "-"}</span>
          </div>
          {/* Level Label */}
          <div className="text-sm font-semibold opacity-90 tracking-widest mb-1">
            {levelInfo.label}
            {profile.name_member && (
              <span className="ml-2 text-gray-500">{profile.name_member}</span>
            )}
          </div>
          {/* Point & Discount */}
          <div className="flex items-center gap-2 md:gap-4 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-medium">
              ⭐ <b>{profile.points ?? 0}</b> ຄະແນນ
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-medium">
              🎁 ສ່ວນຫຼຸດ <b>{profile.discount ?? 0}</b>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
