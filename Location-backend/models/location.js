import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  coordinates: {
    lat: Number,
    lng: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Location", locationSchema);
