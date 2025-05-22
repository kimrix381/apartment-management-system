export const createMaintenanceRequest = async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ message: "Description is required" });
  }

  const request = new createMaintenanceRequest({
    description,
    tenant: req.user._id,
  });

  await request.save();
  const populated = await request.populate("tenant", "email");
  res.status(201).json(populated);
};
