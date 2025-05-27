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
import bg from "./assets/bg.jpg";

import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AppLayout = ({ role, setRole }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded); // { id, name, email, role } — depends on your backend token
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setRole(null);
    navigate("/login");
  };
  return (
    <div className="p-4 text-center text-white">
      <header
        className="flex justify-between items-center mb-4 p-2 bg-center text-sky-200 rounded-2xl slide-top"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <h1 className="text-xl font-bold ml-5 underline decoration-sky-500">
          Apartment Management
        </h1>
        <h1 className="text-xl font-bold underline decoration-pink-500">
          {user.role} Dashboard
        </h1>

        {user && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-right">
              <div className="font-semibold">{user.name}</div>
              <div className="text-sky-200">{user.email}</div>
              <div className="text-sky-200">{user.role}</div>
              <div className="text-sky-200">{user.houseNumber}</div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded mr-10"
            >
              Logout
            </button>
          </div>
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
