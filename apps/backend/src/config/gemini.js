const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

let geminiModel = null;

const getGeminiModel = () => {
  if (geminiModel) return geminiModel;

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GEMINI_API_KEY environment variable is not set");
  }

  geminiModel = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-preview-04-17",
    apiKey,
    temperature: 0.2,
    maxOutputTokens: 2048,
  });

  return geminiModel;
};

module.exports = { getGeminiModel };
