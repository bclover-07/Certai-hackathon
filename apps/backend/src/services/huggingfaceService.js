const { getHfClient } = require("../config/huggingface");

const withTimeout = (promise, ms = 5000, errorMessage = "HuggingFace classification timed out") => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), ms))
  ]);
};

const classify = async (text, categories) => {
  const hf = getHfClient();

  const result = await withTimeout(
    hf.zeroShotClassification({
      model: "facebook/bart-large-mnli",
      inputs: text,
      parameters: {
        candidate_labels: categories,
      },
    }),
    5000
  );

  const output = Array.isArray(result) ? result[0] : result;

  if (!output || !output.labels || !output.scores) {
    throw new Error("Unexpected HuggingFace classification response format");
  }

  const topIndex = output.scores.indexOf(Math.max(...output.scores));
  const topLabel = output.labels[topIndex];
  const topScore = output.scores[topIndex];

  return {
    category: topLabel,
    confidence: topScore,
    allScores: output.labels.reduce((acc, label, idx) => {
      acc[label] = output.scores[idx];
      return acc;
    }, {}),
  };
};

module.exports = { classify };
