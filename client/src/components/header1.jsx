import jwtDecode from "jwt-decode";
import { useEffect, useState } from "react";

const Header = ({ handleLogout }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded); // { id, name, email, role } — depends on your backend token
    }
  }, []);

  return (
    <header className="flex justify-between items-center mb-4">
      <h1 className="text-xl font-bold">Apartment Management</h1>

      {user && (
        <div className="flex items-center gap-4">
          <div className="text-sm text-right">
            <div className="font-semibold">{user.name}</div>
            <div className="text-gray-500">{user.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
