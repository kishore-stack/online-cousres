import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";


export default function Navbar() {
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
      
      {/* LEFT */}
      <Link to="/" className="text-xl font-bold text-blue-600">
        Airman
      </Link>

      {/* RIGHT */}
      <div className="flex items-center gap-6">

        {user && (
          <>
            <Link to="/courses" className="hover:text-blue-600">
              Courses
            </Link>

            {(user.role === "ADMIN" || user.role === "INSTRUCTOR") && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                {user.role}
              </span>
            )}

            <span className="text-gray-600 text-sm">
              {user.name}
            </span>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}

        {!user && (
          <Link
            to="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Login
          </Link>
        )}

      </div>
    </nav>
  );
}