import mongoose from "mongoose";

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


// 스키마가 아닌 모델(일종의 클래스)로 반환하여 이를 가지고 바로 유저 객체(인스턴스) 생성 가능
export default mongoose.model("User", userSchema);
