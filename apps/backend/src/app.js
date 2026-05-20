const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://certai.vercel.app'
  ],
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.get('/health', (_, res) => res.json({
  status: 'OK',
  version: '1.0.0',
  ai: 'Gemini 2.5 Flash + LangGraph.js',
  chain: 'Base Sepolia 84532'
}));

app.use('/api/v1', routes);
app.use(errorHandler);

module.exports = app;
