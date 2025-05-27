import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "animate.css";

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
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage:
          "url('https://images.squarespace-cdn.com/content/v1/5e82939525f53d07de1d635c/1593551839409-L5BGNNCKCP178VX0N5SY/Mason%2526Wales-Nevis-Building-Queenstown-Residential-Contemporary-Hero.jpg')",
      }}
    >
      <div className="text-center mb-10">
        <div className="bouncing-letters text-2xl sm:text-3xl md:text-4xl font-bold space-y-1">
          <p className="text-sky-500">
            {"APARTMENT".split("").map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </p>
          <p className="text-pink-500">
            {"MANAGEMENT".split("").map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </p>
          <p className="text-indigo-500">
            {"SYSTEM".split("").map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleLogin}
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 shadow-md w-full max-w-sm rounded-2xl animate__animated animate__fadeInUp"
      >
        <h2 className="text-xl font-bold mb-4 text-center text-white">Login</h2>
        {error && <p className="text-red-200 text-sm mb-2">{error}</p>}
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
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-all duration-200 card"
        >
          <h2>Login</h2>
        </button>
        <p className="mt-4 text-white text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-green-200 underline">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
