import { useEffect, useState } from "react";
import axios from "axios";

const allHouseNumbers = [
  "NO 1",
  "NO 2",
  "NO 3",
  "NO 4",
  "NO 5",
  "NO 6",
  "NO 7",
  "NO 8",
  "NO 9",
  "NO 10",
];

const HouseSelect = ({ selectedHouse, onChange }) => {
  const [occupiedHouses, setOccupiedHouses] = useState([]);

  useEffect(() => {
    const fetchOccupiedHouses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/tenants");
        const usedHouses = res.data
          .map((tenant) => tenant.houseNumber)
          .filter(Boolean); // filter out undefined/null
        setOccupiedHouses(usedHouses);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      }
    };

    fetchOccupiedHouses();
  }, []);

  const availableHouses = allHouseNumbers.filter(
    (num) => !occupiedHouses.includes(num)
  );

  return (
    <select
      name="houseNumber"
      value={selectedHouse}
      onChange={onChange}
      className="w-full p-2 border rounded mb-4"
    >
      <option value="">Select House Number</option>
      {availableHouses.map((num) => (
        <option key={num} value={num}>
          {num}
        </option>
      ))}
    </select>
  );
};

export default HouseSelect;
