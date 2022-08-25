import mongoose from "mongoose";
import "dotenv/config";

const rpsUserSchema = mongoose.Schema(
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
    }
  },
  {
    timestamps: true,
  }
);


/**
 * Mongo DB의 rpsUser 모델
 */
export default mongoose.model("rpsUser", rpsUserSchema);
