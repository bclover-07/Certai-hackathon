const { HfInference } = require("@huggingface/inference");

let hfClient = null;

const getHfClient = () => {
  if (hfClient) return hfClient;

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY environment variable is not set");
  }

  hfClient = new HfInference(apiKey);
  return hfClient;
};

module.exports = { getHfClient };
