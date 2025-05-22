// ---------------- /client/src/components/Auth/Login.jsx ----------------
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Login = ({ setRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const API = import.meta.env.VITE_SERVER_URL;
      const res = await axios.post(`${API}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      const decoded = JSON.parse(atob(res.data.token.split(".")[1]));
      setRole(decoded.role);
      navigate(decoded.role === "admin" ? "/admin" : "/tenant");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Login
        </button>
        <p className="mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 underline">
            Register here
          </Link>
        </p>
        ;
      </form>
    </div>
  );
};

export default Login;
