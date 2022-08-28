import mongoose from "mongoose";
import "dotenv/config";

const bowlingUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    nickname: {
      type: String,
      required: true,
      unique: true,
    },
    eloRating: {
      type: Number,
      default: parseInt(process.env.ELORATING_DEFAULT),
    },
    sumOfScore: {
      type: Number,
      default: 0,
    },
    match: {
      type: Number,
      default: 0,
    },
    win: {
      type: Number,
      default: 0,
    },
    draw: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("bowlingUser", bowlingUserSchema);
