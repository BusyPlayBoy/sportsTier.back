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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

noticeSchema.virtual("id").get(function () {
  return this._id.toString();
});

export default mongoose.model("Notice", noticeSchema);
