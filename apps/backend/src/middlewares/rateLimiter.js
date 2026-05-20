const rateLimit = require("express-rate-limit");

const claimLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => {
    return req.body?.walletAddress || req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many claim requests. Please try again in 5 minutes.",
  },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

module.exports = { claimLimiter, generalLimiter };
