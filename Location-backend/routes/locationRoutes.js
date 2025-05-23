import express from "express";
import Location from "../models/location.js";
import authMiddleware from "../middlewares/authMiddlewares.js";

const router = express.Router();

// Save or update location
router.post("/update", authMiddleware, async (req, res) => {
  const { lat, lng } = req.body;
  const userId = req.user.id;

  try {
    const newLocation = new Location({
      userId,
      coordinates: { lat, lng }
    });

    await newLocation.save();
    res.json({ message: "Location saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save location" });
  }
});

export default router;
