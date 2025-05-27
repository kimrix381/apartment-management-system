// ---------------- /client/src/components/Auth/Login.jsx ----------------
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
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
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.squarespace-cdn.com/content/v1/5e82939525f53d07de1d635c/1593551839409-L5BGNNCKCP178VX0N5SY/Mason%2526Wales-Nevis-Building-Queenstown-Residential-Contemporary-Hero.jpg')",
      }}
    >
      <h1 className="text-4xl fixed top-0 right-0 left-125 font-bold ">
        {/* <a class="underline decoration-sky-500">Apartment </a>
        <a class="underline decoration-pink-500">Management </a>
        <a class="underline decoration-indigo-500">System</a> */}
        <div class="bouncing-letters text-4xl fixed top-10 right-0 left-20 font-bold ">
          <p class="text-sky-500">
            <span>A</span>
            <span>P</span>
            <span>A</span>
            <span>R</span>
            <span>T</span>
            <span>M</span>
            <span>E</span>
            <span>N</span>
            <span>T</span>
          </p>
          <a class="text-pink-500">
            <span class="space"></span>
            <span>M</span>
            <span>A</span>
            <span>N</span>
            <span>A</span>
            <span>G</span>
            <span>E</span>
            <span>M</span>
            <span>E</span>
            <span>N</span>
            <span>T</span>
          </a>
          <span class="space"></span>
          <a class="text-indigo-500">
            <span>S</span>
            <span>Y</span>
            <span>S</span>
            <span>T</span>
            <span>E</span>
            <span>M</span>
          </a>
        </div>
      </h1>

      <form
        onSubmit={handleLogin}
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 shadow-md w-80 rounded-2xl fixed scale-up-ver-center"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
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
          className="w-full bg-blue-600 text-white py-2 rounded card "
        >
          <h2>login</h2>
        </button>
        <p className="mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-green-300 underline">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
