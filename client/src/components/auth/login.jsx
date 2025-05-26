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
      localStorage.setItem("houseNumber", res.data.user.houseNumber);
      console.log(res.data.user.houseNumber);

      const decoded = JSON.parse(atob(res.data.token.split(".")[1]));
      setRole(decoded.role);
      navigate(decoded.role === "admin" ? "/admin" : "/tenant");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.squarespace-cdn.com/content/v1/5e82939525f53d07de1d635c/1593551839409-L5BGNNCKCP178VX0N5SY/Mason%2526Wales-Nevis-Building-Queenstown-Residential-Contemporary-Hero.jpg')",
      }}
    >
      <form
        onSubmit={handleLogin}
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 shadow-md w-80 rounded-2xl"
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
          <Link to="/register" className="text-green-300 underline">
            Register here
          </Link>
        </p>
        ;
      </form>
    </div>
  );
};

export default Login;
