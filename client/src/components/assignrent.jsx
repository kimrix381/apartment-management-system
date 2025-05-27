import { useState, useEffect } from "react";
import axios from "axios";
const API = import.meta.env.VITE_SERVER_URL;
const AssignRent = () => {
  const [houseNumber, setHouseNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [houseNumbers, setHouseNumbers] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch tenants with house numbers
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/auth/tenants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const uniqueHouseNumbers = res.data.map((user) => user.houseNumber);
        setHouseNumbers(uniqueHouseNumbers);
      } catch (err) {
        console.error("Error fetching tenants:", err);
        setError("Failed to fetch tenants");
      }
    };

    fetchTenants();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/api/rent/assign`,
        { houseNumber, amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Rent assigned successfully!");
      setHouseNumber("");
      setAmount("");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="p-4 border rounded shadow-md">
      <h2 className="text-lg font-semibold mb-2">Assign Rent to House</h2>
      {success && <p className="text-green-600">{success}</p>}
      {error && <p className="text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
        <select
          value={houseNumber}
          onChange={(e) => setHouseNumber(e.target.value)}
          className="p-2 border rounded"
          required
        >
          <option value="">Select House Number</option>
          {houseNumbers.map((hn, index) => (
            <option key={index} value={hn}>
              {hn}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Rent Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="animated-gradient-btn text-white px-4 py-2 rounded"
        >
          Assign
        </button>
      </form>
    </div>
  );
};

export default AssignRent;
