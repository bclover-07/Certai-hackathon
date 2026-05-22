const mongoose = require("mongoose");
const path = require("path");

const User = require("../src/models/User");

const dbPath = path.join(__dirname, "../data/db");
console.log("Database path:", dbPath);

const getPersistentMongoServer = async () => {
  const { MongoMemoryServer } = require("mongodb-memory-server");
  return await MongoMemoryServer.create({
    instance: {
      dbPath: dbPath,
      storageEngine: "wiredTiger"
    }
  });
};

const run = async () => {
  try {
    const mongoServer = await getPersistentMongoServer();
    const uri = mongoServer.getUri();
    console.log("Connecting to:", uri);
    await mongoose.connect(uri);
    console.log("Connected successfully");

    const users = await User.find({});
    console.log(`Total users in database: ${users.length}`);
    users.forEach((u, i) => {
      console.log(`\nUser #${i + 1}:`);
      console.log(`  Wallet Address: ${u.walletAddress}`);
      console.log(`  Privy User ID:  ${u.privyUserId}`);
      console.log(`  Email:          ${u.email}`);
      console.log(`  Display Name:   ${u.profile?.displayName}`);
      console.log(`  Organization:   ${u.profile?.organization}`);
      console.log(`  Specialty:      ${u.profile?.specialty}`);
    });

    await mongoose.disconnect();
    await mongoServer.stop();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

run();
