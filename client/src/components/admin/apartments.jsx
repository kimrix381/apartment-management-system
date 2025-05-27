import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import AssignRent from "../assignrent.jsx";

const API = import.meta.env.VITE_SERVER_URL;
const socket = io(import.meta.env.VITE_SERVER_URL);

const Apartments = () => {
  const [apartments, setApartments] = useState([]);
  const [form, setForm] = useState({ name: "", address: "", units: "" });
  const [editing, setEditing] = useState(null);
  const [tenantEmail, setTenantEmail] = useState("");
  const [selectedUnit, setSelectedUnit] = useState({
    apartmentId: "",
    unitId: "",
  });
  const [rentAmount, setRentAmount] = useState("");
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [notices, setNotices] = useState([]);
  const [noticeText, setNoticeText] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [tenants, setTenants] = useState([]);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchApartments = async () => {
    const res = await axios.get(`${API}/api/apartments`, config);
    setApartments(res.data);
  };

  const fetchMaintenance = async () => {
    const res = await axios.get(`${API}/api/maintenance/all`, config);
    setMaintenanceRequests(res.data);
  };

  const fetchNotices = async () => {
    const res = await axios.get(`${API}/api/notices`, config);
    setNotices(res.data);
  };

  const fetchTenants = async () => {
    try {
      const res = await axios.get(`${API}/api/auth/tenants`, config);
      setTenants(res.data);
    } catch (err) {
      console.error("Failed to fetch tenants:", err);
    }
  };

  const handleDeleteTenant = async (id) => {
    if (confirm("Are you sure you want to delete this tenant?")) {
      try {
        await axios.delete(`${API}/api/auth/tenants/${id}`, config);
        fetchTenants();
      } catch (err) {
        console.error("Failed to delete tenant:", err);
      }
    }
  };

  useEffect(() => {
    fetchApartments();
    fetchMaintenance();
    fetchNotices();
    fetchTenants();
    const fetchChats = async () => {
      const res = await axios.get(`${API}/api/chat`);
      setChatMessages(res.data);
    };
    fetchChats();
    socket.on("new_notice", (notice) =>
      setNotices((prev) => [notice, ...prev])
    );
    socket.on("new_chat", (msg) => setChatMessages((prev) => [...prev, msg]));
    return () => {
      socket.off("new_notice");
      socket.off("new_chat");
    };
  }, []);

  const updateMaintenanceStatus = async (id, status) => {
    try {
      if (status === "Resolved") {
        await axios.delete(`${API}/api/maintenance/${id}`, config);
        setMaintenanceRequests((prev) => prev.filter((req) => req._id !== id));
      } else {
        await axios.put(`${API}/api/maintenance/${id}`, { status }, config);
        setMaintenanceRequests((prev) =>
          prev.map((req) => (req._id === id ? { ...req, status } : req))
        );
      }
    } catch (error) {
      alert(error.response?.data?.error || "An error occurred");
      console.error("Error updating/deleting maintenance request:", error);
    }
  };

  const handlePostNotice = async () => {
    const res = await axios.post(
      `${API}/api/notices`,
      { message: noticeText },
      config
    );
    setNoticeText("");
    setNotices([res.data, ...notices]);
    socket.emit("new_notice", res.data);
  };

  const handleDeleteNotice = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/notices/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotices((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(
        "Failed to delete notice:",
        err.response?.data || err.message
      );
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const msg = { sender: "Admin", text: chatInput };
    socket.emit("new_chat", msg);
    setChatInput("");

    try {
      await axios.post(`${API}/api/chat`, msg);
    } catch (err) {
      console.error("Error saving message:", err.message);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Apartment Management</h1>

      <div className="mb-10">
        <h2 className="text-xl font-bold mb-2">All Tenants</h2>
        <ul className="space-y-2">
          {tenants.map((tenant) => (
            <li
              key={tenant._id}
              className="flex flex-col sm:flex-row justify-between gap-2 items-start sm:items-center border p-3 rounded bg-black text-white"
            >
              <div>
                <div>Email: {tenant.email}</div>
                <div>House No: {tenant.houseNumber}</div>
              </div>
              <button
                onClick={() => handleDeleteTenant(tenant._id)}
                className="bg-red-600 shake-button text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <AssignRent />

      <div className="mb-10">
        <h2 className="text-xl font-bold mb-2">Maintenance Requests</h2>
        <ul className="space-y-2">
          {maintenanceRequests.map((req) => (
            <li
              key={req._id}
              className="p-3 border rounded bg-black text-white flex flex-col animated-border md:flex-row justify-between gap-2 items-start md:items-center"
            >
              <div>
                <div className="font-semibold text-black">
                  Problem: {req.description}
                </div>
                <div className="text-sm text-black">
                  Tenant Email: {req.tenant?.email || "Unknown"}
                </div>
                <div className="text-sm text-black">Status: {req.status}</div>
                <div className="text-sm text-black">
                  House: {req.houseNumber}
                </div>
              </div>
              <select
                value={req.status}
                onChange={(e) =>
                  updateMaintenanceStatus(req._id, e.target.value)
                }
                className="p-2 border rounded bg-white text-black"
              >
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
              </select>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold mb-2">Notice Board</h2>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            type="text"
            placeholder="Enter notice"
            value={noticeText}
            onChange={(e) => setNoticeText(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handlePostNotice}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Post
          </button>
        </div>

        <ul className="space-y-2">
          {notices.map((n) => (
            <li
              key={n._id}
              className="border p-3 rounded text-black text-lg bg-yellow-100 flex justify-between items-center"
            >
              <span>{n.message}</span>
              <button
                onClick={() => handleDeleteNotice(n._id)}
                className="bg-red-500 text-white px-2 py-1 rounded ml-4 text-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold mb-2">Admin-Tenant Chat</h2>
        <div className="h-48 overflow-y-auto border rounded p-2 bg-gray-50">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-1 ${
                msg.sender === "Admin" ? "text-right" : "text-left"
              }`}
            >
              <span className="inline-block px-2 py-1 rounded bg-gradient-to-t from-sky-500 to-indigo-500 text-white max-w-full break-words">
                {msg.sender}: {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-grow p-2 border rounded"
          />
          <button
            onClick={sendMessage}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Apartments;
