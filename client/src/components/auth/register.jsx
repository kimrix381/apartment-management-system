import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import HouseSelect from "../houseselect.jsx";
import construction from "../../assets/construction.jpg";

const Register = ({ setRole }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "tenant",
    houseNumber: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const API = import.meta.env.VITE_SERVER_URL;
      const res = await axios.post(`${API}/api/auth/register`, form);
      localStorage.setItem("token", res.data.token);
      const decoded = JSON.parse(atob(res.data.token.split(".")[1]));
      navigate(decoded.role === "admin" ? "/admin" : "/tenant");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${construction})` }}
    >
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4">Register</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-2"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-2"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-2"
          required
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="tenant">Tenant</option>
          <option value="admin">Admin</option>
        </select>
        <HouseSelect
          selectedHouse={form.houseNumber}
          onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
