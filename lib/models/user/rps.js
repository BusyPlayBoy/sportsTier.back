import mongoose from "mongoose";
import "dotenv/config";

const rpsUserSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    eloRating: {
      type: Number,
      default: parseInt(process.env.ELORATING_DEFAULT),
    },
    match: {
      type: Number,
      default: 0,
    },
    win: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("rpsUser",rpsUserSchema); 
