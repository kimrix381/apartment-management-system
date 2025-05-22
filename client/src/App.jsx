// ---------------- /client/src/App.jsx ----------------
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Apartments from "./components/admin/apartments.jsx";
import TenantDashboard from "./components/tenant/dashboard.jsx";
import Login from "./components/auth/login.jsx";
import Register from "./components/auth/register.jsx";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AppLayout = ({ role, setRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setRole(null);
    navigate("/login");
  };
  return (
    <div className="p-4 text-center text-gray-800">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Apartment Management</h1>
        {role && (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        )}
      </header>
      <Routes>
        <Route
          path="/admin"
          element={role === "admin" ? <Apartments /> : <Navigate to="/login" />}
        />
        <Route
          path="/tenant"
          element={
            role === "tenant" ? <TenantDashboard /> : <Navigate to="/login" />
          }
        />
        <Route
          path="*"
          element={
            <Navigate
              to={
                role === "admin"
                  ? "/admin"
                  : role === "tenant"
                  ? "/tenant"
                  : "/login"
              }
            />
          }
        />
      </Routes>
    </div>
  );
};

const App = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch {
        setRole(null);
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setRole={setRole} />} />
        <Route
          path="/*"
          element={<AppLayout role={role} setRole={setRole} />}
        />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;
