import mongoose from "mongoose";
import "dotenv/config";

const connectionString = process.env.MONGO_CONNECTION_STRING;

if (!connectionString) {
  console.log("MongoDB connection string missing!");
  process.exit(1);
} else {
  mongoose
    .connect(connectionString)
    .then(() => {
      console.log(`MongoDB connection established.... => ${connectionString}`);
    })
    .catch((err) => {
      console.error("MongoDB error: " + err.message);
      process.exit(1);
    });
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB error: " + err.message);
    process.exit(1);
  });
}
