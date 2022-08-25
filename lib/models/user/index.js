import mongoose from "mongoose";

/**
 * User 데이터의 정합성을 위한 스키마
 */
const userSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      default: "",
    },
    allowNotice: {
      type: Boolean,
      required: true,
    },
    isSuperUser: {
      type: Boolean,
      default: false,
    },
    salt: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Mongo DB의 User 모델
 */
export default mongoose.model("User", userSchema);
