const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
let mongoServer = null;

const ensureDbName = (uri) => {
  if (!uri) return uri;
  try {
    const url = new URL(uri);
    if (!url.pathname || url.pathname === "/") {
      url.pathname = "/certai";
      return url.toString();
    }
    return uri;
  } catch {
    return uri;
  }
};

const getPersistentMongoServer = async () => {
  const { MongoMemoryServer } = require("mongodb-memory-server");
  const dbPath = path.join(__dirname, "../../data/db");
  
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  return await MongoMemoryServer.create({
    instance: {
      dbPath: dbPath,
      storageEngine: "wiredTiger"
    }
  });
};

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("[MongoDB] MONGODB_URI not set. Falling back to persistent local database for development.");
    uri = "mongodb://localhost:27017/certai";
  }

  uri = ensureDbName(uri);

  mongoose.connection.on("connected", () => {
    console.log("[MongoDB] Connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[MongoDB] Connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[MongoDB] Disconnected");
  });

  const tryConnect = async (connectionUri) => {
    await mongoose.connect(connectionUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  };

  try {
    if (uri.includes("localhost") || uri.includes("127.0.0.1")) {
      mongoServer = await getPersistentMongoServer();
      uri = mongoServer.getUri();
      console.log(`[MongoDB] Using persistent local database: ${uri}`);
    }
    await tryConnect(uri);
  } catch (err) {
    console.error("[MongoDB] Initial connection failed:", err.message);
    if (!uri.includes("localhost") && !uri.includes("127.0.0.1")) {
      console.log("[MongoDB] Attempting fallback to persistent local database...");
      try {
        mongoServer = await getPersistentMongoServer();
        const fallbackUri = mongoServer.getUri();
        console.log(`[MongoDB] Using fallback persistent local database: ${fallbackUri}`);
        await tryConnect(fallbackUri);
      } catch (fallbackErr) {
        console.error("[MongoDB] Fallback persistent local database also failed:", fallbackErr.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;

