import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

// Use VITE_SERVER_URL for socket, and VITE_API_URL for REST API
const socket = io(import.meta.env.VITE_SERVER_URL);
const API = import.meta.env.VITE_SERVER_URL;
const houseNumber = localStorage.getItem("houseNumber");

const TenantDashboard = () => {
  const [notices, setNotices] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [rentStatus, setRentStatus] = useState(null);
  const [maintenanceRequests, setMaintenance] = useState([]);
  const [complaint, setComplaint] = useState("");

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = async () => {
    try {
      const [noticeRes, chatRes, rentRes, maintRes] = await Promise.all([
        axios.get(`${API}/api/notices`, config),
        axios.get(`${API}/api/chat`, config),
        axios.get(`${API}/api/rent`, config),
        axios.get(`${API}/api/maintenance/my`, config),
      ]);

      setNotices(Array.isArray(noticeRes.data) ? noticeRes.data : []);
      setChatMessages(Array.isArray(chatRes.data) ? chatRes.data : []);
      setRentStatus(rentRes.data);
      setMaintenance(Array.isArray(maintRes.data) ? maintRes.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchNotices = async () => {
    const res = await axios.get(`${API}/api/notices`, config);
    setNotices(res.data);
  };

  useEffect(() => {
    fetchData();
    fetchNotices();
    const fetchChats = async () => {
      const res = await axios.get(`${API}/api/chat`);
      setChatMessages(res.data);
    };
    fetchChats();

    const fetchMaintenance = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/maintenance`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMaintenance(res.data); // <- set state with tenant's complaints
      } catch (err) {
        console.error("Error fetching maintenance:", err);
      }
    };

    fetchMaintenance();

    socket.on("new_notice", (notice) =>
      setNotices((prev) => [notice, ...prev])
    );
    socket.on("new_chat", (msg) => setChatMessages((prev) => [...prev, msg]));

    return () => {
      socket.off("new_notice");
      socket.off("new_chat");
    };
  }, []);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const houseNumber = localStorage.getItem("houseNumber") || "Unknown";

    const msg = { sender: houseNumber, text: chatInput };
    socket.emit("new_chat", msg); // emit real-time

    setChatInput("");

    try {
      await axios.post(`${API}/api/chat`, msg); // ✅ save to DB
    } catch (err) {
      console.error("Error saving message:", err.message);
    }
  };

  const fileComplaint = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API}/api/maintenance`,
        {
          description: complaint,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Complaint filed:", response.data);
      setComplaint(""); // clear the input
    } catch (error) {
      console.error("Error filing complaint:", error);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tenant Dashboard</h1>

      {/* Notices */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Notices</h2>
        <ul className="space-y-2">
          {notices.map((n) => (
            <li key={n._id} className="border p-3 rounded bg-yellow-100">
              {n.message}
            </li>
          ))}
        </ul>
      </div>

      {/* Rent */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Rent</h2>
        {rentStatus ? (
          <div className="p-3 bg-green-100 rounded">
            Status: {rentStatus.paid ? "Paid" : "Unpaid"} - Amount: $
            {rentStatus.amount}
          </div>
        ) : (
          <div>No rent info found</div>
        )}
      </div>

      {/* Maintenance */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Maintenance Requests</h2>
        <ul className="space-y-2">
          {maintenanceRequests.length ? (
            maintenanceRequests.map((req) => (
              <li key={req._id} className="border p-2 rounded">
                {req.description} - {req.status}
              </li>
            ))
          ) : (
            <li>No maintenance requests found</li>
          )}
        </ul>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Describe your issue"
          />
          <button
            onClick={fileComplaint}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Chat */}
      <div>
        <h2 className="text-xl font-semibold">Chat with Admin</h2>
        <div className="h-48 overflow-y-auto border rounded p-2 bg-gray-50">
          {chatMessages.length ? (
            chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-1 ${
                  msg.sender === "Tenant" ? "text-right" : "text-left"
                }`}
              >
                <span className="inline-block px-2 py-1 rounded bg-blue-200">
                  {msg.sender}: {msg.text}
                </span>
              </div>
            ))
          ) : (
            <div>No chat messages yet</div>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-grow p-2 border rounded"
            placeholder="Type your message"
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

export default TenantDashboard;
