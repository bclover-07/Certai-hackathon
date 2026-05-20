const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  mongoose.connection.on("connected", () => {
    console.log("[MongoDB] Connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[MongoDB] Connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[MongoDB] Disconnected");
  });

  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (err) {
    console.error("[MongoDB] Initial connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
