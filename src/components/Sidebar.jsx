import { Link } from "react-router-dom";
function Sidebar() {
  return (
    <div className="w-60 bg-gray-900 text-white min-h-screen p-4">
      <h2 className="text-xl font-semibold mb-6">Menu</h2>
      <ul className="space-y-3">
        <li>
          <Link to="/" className="hover:text-gray-400">
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/add-expense" className="hover:text-gray-400">
            Add Expense
          </Link>
        </li>
        <li className="hover:text-gray-400 cursor-pointer">Reports</li>
      </ul>
    </div>
  );
}

export default Sidebar;
