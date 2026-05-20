const errorHandler = (err, req, res, _next) => {
  console.error("[Error]", err.message || err);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation error.",
      errors: messages,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}. This record already exists.`,
    });
  }

  if (err.status === 429 || err.type === "ratelimit") {
    return res.status(429).json({
      success: false,
      message: "Rate limit exceeded. Please slow down.",
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid value for ${err.path}: ${err.value}`,
    });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Authentication token is invalid or expired.",
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error." : err.message,
  });
};

module.exports = errorHandler;
