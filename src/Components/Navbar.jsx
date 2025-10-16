import { NavLink, Link } from "react-router-dom";

const Navbar = () => {
  const linkClass =
    "hover:text-indigo-400 transition-colors duration-200 relative";
  const activeClass =
    "text-indigo-400 font-semibold after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-indigo-500";

  return (
    <header className="bg-gray-900 text-white shadow-md">
      {/* --- Top Bar --- */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700">
        {/* Clickable Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-wide hover:text-indigo-400 transition-colors"
        >
          Nexora
        </Link>

        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search..."
            className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-semibold">
            Signup
          </button>
          <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-sm font-semibold">
            Login
          </button>
        </div>
      </div>

      {/* --- Navigation Menu --- */}
      <nav className="flex items-center gap-8 px-6 py-3 bg-gray-800">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Products
        </NavLink>

        <NavLink
          to="/distributors"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Distributors
        </NavLink>

        <NavLink
          to="/customers"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Customers
        </NavLink>

        <NavLink
          to="/salesmen"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Salesmen
        </NavLink>

        <NavLink
          to="/assignments"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Assignments
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          ⚙️
        </NavLink>
      </nav>
    </header>
  );
};

export default Navbar;
