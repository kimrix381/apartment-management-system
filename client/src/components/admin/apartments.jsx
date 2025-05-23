import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const unitsArray = form.units
      .split(",")
      .map((u) => ({ unitNumber: u.trim() }));
    if (editing) {
      await axios.put(
        `${API}/api/apartments/${editing}`,
        { ...form, units: unitsArray },
        config
      );
    } else {
      await axios.post(
        `${API}/api/apartments`,
        { ...form, units: unitsArray },
        config
      );
    }
    setForm({ name: "", address: "", units: "" });
    setEditing(null);
    fetchApartments();
  };

  const handleEdit = (apt) => {
    setForm({
      name: apt.name,
      address: apt.address,
      units: apt.units.map((u) => u.unitNumber).join(", "),
    });
    setEditing(apt._id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API}/api/apartments/${id}`, config);
    fetchApartments();
  };

  const handleAssignTenant = async () => {
    try {
      await axios.put(
        `${API}/api/apartments/${selectedUnit.apartmentId}/assign`,
        { unitId: selectedUnit.unitId, tenantEmail, rent: rentAmount },
        config
      );
      setTenantEmail("");
      setSelectedUnit({ apartmentId: "", unitId: "" });
      setRentAmount("");
      fetchApartments();
    } catch (err) {
      console.error(err);
      alert("Failed to assign tenant");
    }
  };

  const handleMarkPaid = async (tenantId) => {
    try {
      await axios.put(`${API}/api/payments/${tenantId}/mark-paid`, {}, config);
      fetchApartments();
    } catch (err) {
      console.error(err);
      alert("Error marking rent paid");
    }
  };

  const updateMaintenanceStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      if (status === "Resolved") {
        await axios.delete(`${API}/api/maintenance/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMaintenanceRequests((prev) => prev.filter((req) => req._id !== id));
      } else {
        await axios.put(
          `${API}/api/maintenance/${id}`,
          { status },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMaintenanceRequests((prev) =>
          prev.map((req) => (req._id === id ? { ...req, status } : req))
        );
      }
    } catch (error) {
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

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const msg = { sender: "Admin", text: chatInput };
    socket.emit("new_chat", msg); // emit real-time

    setChatInput("");

    try {
      await axios.post(`${API}/api/chat`, msg); // ✅ save to DB
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
              className="flex justify-between items-center border p-3 rounded bg-white"
            >
              <div>
                <div>Email: {tenant.email}</div>
                <div>House No: {tenant.houseNumber}</div>
              </div>
              <button
                onClick={() => handleDeleteTenant(tenant._id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Maintenance Requests */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-2">Maintenance Requests</h2>
        <ul className="space-y-2">
          {maintenanceRequests.map((req) => (
            <li
              key={req._id}
              className="p-3 border rounded bg-gray-100 flex justify-between items-center"
            >
              <div>
                <div className="font-semibold text-gray-800">
                  Problem: {req.description}
                </div>
                <div className="text-sm text-gray-600">
                  Tenant Email: {req.tenant?.email || "Unknown"}
                </div>
                <div className="text-sm text-gray-600">
                  Status: {req.status}
                </div>
              </div>

              <select
                value={req.status}
                onChange={(e) =>
                  updateMaintenanceStatus(req._id, e.target.value)
                }
                className="p-1 border rounded"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold mb-2">Notice Board</h2>
        <div className="flex gap-2 mb-2">
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
            <li key={n._id} className="border p-3 rounded bg-yellow-100">
              {n.message}
            </li>
          ))}
        </ul>
      </div>

      {/* Real-Time Chat */}
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
              <span className="inline-block px-2 py-1 rounded bg-blue-200">
                {msg.sender}: {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
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
