import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md text-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <Link
          to="/"
          className="text-xl font-extrabold text-blue-600 tracking-wide"
        >
          🛒 E-Kart
        </Link>

        <div className="flex items-center space-x-6 text-gray-700 font-medium relative">
          <Link to="/" className="hover:text-blue-600 transition duration-300">
            Home
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="hover:text-blue-600 transition duration-300"
            >
              Admin Panel
            </Link>
          )}

          {user && !isAdmin && (
            <>
              <Link
                to="/cart"
                className="hover:text-blue-600 transition duration-300"
              >
                Cart
              </Link>

              {/* Hamburger Icon */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="focus:outline-none"
              >
                {menuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute top-12 right-0 bg-white border rounded shadow-lg p-3 space-y-2 z-50">
                  <Link
                    to="/order"
                    className="block hover:text-blue-600 transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left text-red-500 hover:text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          )}

          {!user && (
            <>
              <Link
                to="/login"
                className="hover:text-blue-600 transition duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hover:text-blue-600 transition duration-300"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
