import mongoose from "mongoose";
const maintenanceRequestSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    status: { type: String, default: "Pending" },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model("MaintenanceRequest", maintenanceRequestSchema);
