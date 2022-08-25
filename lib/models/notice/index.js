import mongoose from "mongoose";

/**
 * 공지 데이터의 유효성을 위한 스키마
 */
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

noticeSchema.virtual("id").get(function () {
  return this._id.toString();
});

/**
 * Mongo DB의 Notice 모델
 */
export default mongoose.model("Notice", noticeSchema);
