import { Link, useNavigate } from "react-router-dom";

function Navbar({ profile }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    import("@line/liff").then((liff) => {
      liff.default.logout();
      navigate("/");
      window.location.reload();
    });
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">💬 LINE LIFF Admin</h1>
        <ul className="flex gap-4 items-center">
          {/* <li><Link to="/" className="hover:underline">Home</Link></li> */}
          <li><Link to="/dashboard" className="hover:underline">User</Link></li>
          <li><Link to="/groups" className="hover:underline">Groups</Link></li>
          <li><Link to="/richmenus" className="hover:underline">RichMenus</Link></li>
          <li><Link to="/assign" className="hover:underline">AssignMenu</Link></li>

          {profile && (
            <li className="flex items-center gap-2 ml-6">
              <img src={profile.pictureUrl} alt="Profile" className="w-8 h-8 rounded-full" />
              <span>{profile.displayName}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded ml-2"
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
