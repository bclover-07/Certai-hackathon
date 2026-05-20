const mongoose = require("mongoose");
require("dns").setServers(["8.8.8.8", "8.8.4.4"]);
let mongoServer = null;

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("[MongoDB] MONGODB_URI not set. Falling back to in-memory server for development.");
    uri = "mongodb://localhost:27017";
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
    if (uri.includes("localhost") || uri.includes("127.0.0.1")) {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log(`[MongoDB] Using in-memory database: ${uri}`);
    }

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
