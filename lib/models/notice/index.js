import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    classification: {
      type: String,
      required: true,
    },
    writer: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notice",noticeSchema);