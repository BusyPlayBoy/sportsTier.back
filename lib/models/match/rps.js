import mongoose from "mongoose";

const rpsMatchSchema = mongoose.Schema(
  {
    player1: {
      type: String,
      required: true,
    },
    player2: {
      type: String,
      required: true,
    },
    winner: {
      type: Number,
      required: true,
    },
    player1Record: {
      type: [Number],
      required: true,
    },
    player2Record: {
      type: [Number],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

rpsMatchSchema.virtual("id").get(function () {
  return this._id.toString();
});


export default mongoose.model("RpsMatch",rpsMatchSchema);