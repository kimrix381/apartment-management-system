import mongoose from "mongoose";

const rentSchema = new mongoose.Schema({
  houseNumber: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
});

export default mongoose.model("Rent", rentSchema);
