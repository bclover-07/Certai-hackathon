const success = (data = null, message = "Success") => {
  return {
    success: true,
    message,
    data,
  };
};

const error = (message = "An error occurred", details = null) => {
  const response = {
    success: false,
    message,
  };
  if (details) {
    response.details = details;
  }
  return response;
};

module.exports = { success, error };
