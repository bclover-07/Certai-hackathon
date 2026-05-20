require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5001;

const start = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected');

    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════╗
║   🏥 CERTAI Backend Running              ║
║   Port: ${PORT}                              ║
║   AI: LangGraph + Gemini 2.5 Flash       ║
║   Chain: Base Sepolia (84532)            ║
╚══════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('❌ Startup failed:', err);
    process.exit(1);
  }
};

start();
