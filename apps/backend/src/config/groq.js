const Groq = require("groq-sdk");

let groqClient = null;

const getGroqClient = () => {
  if (groqClient) return groqClient;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }

  groqClient = new Groq({ apiKey });
  return groqClient;
};

module.exports = { getGroqClient };
