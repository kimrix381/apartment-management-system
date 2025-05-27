import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import bg from "../../assets/bg.jpg";

// Use VITE_SERVER_URL for socket, and VITE_API_URL for REST API
const socket = io(import.meta.env.VITE_SERVER_URL);
const API = import.meta.env.VITE_SERVER_URL;
const houseNumber = localStorage.getItem("houseNumber");

const TenantDashboard = () => {
  const [notices, setNotices] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [rent, setRent] = useState(null);
  const [error, setError] = useState("");
  const [maintenanceRequests, setMaintenance] = useState([]);
  const [complaint, setComplaint] = useState("");
  const [activeTab, setActiveTab] = useState("notices");

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

    const fetchRent = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API}/api/rent/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRent(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch rent");
      }
    };

    fetchRent();

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
    <div
      className="bg-cover bg-center "
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="flex  ">
        {/* <h1 className="text-2xl font-bold mb-4">Tenant Dashboard</h1> */}

        {/* Sidebar */}
        <aside className="w-64 bg-linear-to-bl from-violet-500 to-fuchsia-500 text-black p-4 space-y-4 rounded-xl flip-scale-2-ver-right h-[250px] ">
          <h2 className="text-2xl font-bold mb-4">Tenant Menu</h2>
          <nav className="space-y-2">
            <button
              className={`block w-full text-left p-2 rounded ${
                activeTab === "notices"
                  ? " bg-linear-to-t from-sky-500 to-indigo-500"
                  : ""
              }`}
              onClick={() => setActiveTab("notices")}
            >
              Notices
            </button>
            <button
              className={`block w-full text-left p-2 rounded ${
                activeTab === "rent"
                  ? "bg-linear-to-t from-sky-500 to-indigo-500"
                  : ""
              }`}
              onClick={() => setActiveTab("rent")}
            >
              Rent
            </button>

            <button
              className={`block w-full text-left p-2 rounded ${
                activeTab === "maintenance"
                  ? "bg-linear-to-t from-sky-500 to-indigo-500"
                  : ""
              }`}
              onClick={() => setActiveTab("maintenance")}
            >
              Maintenance
            </button>
            <button
              className={`block w-full text-left p-2 rounded ${
                activeTab === "chat"
                  ? "bg-linear-to-t from-sky-500 to-indigo-500"
                  : ""
              }`}
              onClick={() => setActiveTab("chat")}
            >
              Chat
            </button>
          </nav>
        </aside>

        <main
          className="flex-1 p-6 bg-gray-100 bg-cover bg-center h-screen rounded-xl flip-scale-2-ver-left"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1644088379091-d574269d422f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dGVjaG5vbG9neSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D')",
          }}
        >
          {activeTab === "rent" && (
            <div>
              <h1 className="text-xl font-bold mb-2">My Rent</h1>
              {/* Rent content goes here */}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-4"></h2>
                {error && <p className="text-red-600">{error}</p>}
                {rent ? (
                  <div className="border p-4 rounded shadow bg-linear-to-t from-sky-500 to-indigo-500 text-black text-2xl">
                    <p>
                      <strong>House Number:</strong> {rent.houseNumber}
                    </p>
                    <p>
                      <strong>Rent Amount Due:</strong> ${rent.amount}
                    </p>
                  </div>
                ) : (
                  <p>Loading rent info...</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "notices" && (
            <div>
              <h1 className="text-xl font-bold mb-2">Notices</h1>
              {/* Notices content goes here */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Notices</h2>
                <ul className="space-y-2">
                  {notices.map((n) => (
                    <li
                      key={n._id}
                      className="border p-3 rounded bg-linear-to-t from-sky-500 to-indigo-500 text-black text-2xl"
                    >
                      {n.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "maintenance" && (
            <div>
              <h1 className="text-xl font-bold mb-2">Maintenance Requests</h1>
              {/* Maintenance content goes here */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Maintenance Requests</h2>
                <ul className="space-y-2">
                  {maintenanceRequests.length ? (
                    maintenanceRequests.map((req) => (
                      <li
                        key={req._id}
                        className="border p-2 rounded bg-linear-to-t from-sky-500 to-indigo-500 text-black text-2xl"
                      >
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
                    className="w-full p-2 border rounded bg-linear-to-t from-sky-500 to-indigo-500 text-black text-2xl"
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
            </div>
          )}

          {activeTab === "chat" && (
            <div>
              <h1 className="text-xl font-bold mb-2">Chat</h1>
              {/* Chat content goes here */}
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
                        <span className="inline-block px-2 py-1 rounded bg-linear-to-t from-sky-500 to-indigo-500 text-black text-xl">
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
                    className="flex-grow p-2 border rounded bg-linear-to-t from-sky-500 to-indigo-500 text-black text-xl"
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
          )}
        </main>
      </div>
    </div>
  );
};

export default TenantDashboard;
