const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const { getGeminiModel } = require("../config/gemini");

const SYSTEM_PROMPT = `You are a credential extraction AI for CERTAI, a blockchain-based credential verification platform.

Your job is to extract structured credential information from natural language claims.

You MUST respond ONLY with valid JSON in this exact format:
{
  "title": "string - the name/title of the credential, course, or certification",
  "issuerName": "string - the organization, institution, or authority that issued it",
  "credentialType": "string - one of: medical_training, academic_credential, professional_certification, continuing_education, clinical_rotation, research_publication, workshop_seminar, license_renewal, volunteer_service",
  "hoursCompleted": number - estimated hours (use 0 if unknown),
  "skills": ["array", "of", "relevant", "skills"],
  "description": "string - brief description of what this credential represents",
  "confidence": number between 0 and 1 - your confidence in the extraction accuracy,
  "expiryYears": number or null - how many years until this credential expires (null if no expiry)
}

Rules:
- Extract ONLY factual information from the claim text
- If information is ambiguous, make reasonable inferences and lower confidence
- hoursCompleted should be estimated based on the type of credential if not stated
- skills should be relevant to the credential type
- confidence should reflect how well-structured and clear the claim is
- Do NOT hallucinate information not present or inferable from the claim`;

const withTimeout = (promise, ms = 5000, errorMessage = "Gemini extraction timed out") => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), ms))
  ]);
};

const extract = async (systemPrompt, userInput) => {
  const model = getGeminiModel();

  const messages = [
    new SystemMessage(systemPrompt || SYSTEM_PROMPT),
    new HumanMessage(userInput),
  ];

  const response = await withTimeout(model.invoke(messages), 5000);
  const content = response.content;

  let parsed;
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in Gemini response");
    }
    parsed = JSON.parse(jsonMatch[0]);
  } catch (parseErr) {
    throw new Error(`Failed to parse Gemini response as JSON: ${parseErr.message}`);
  }

  return parsed;
};

module.exports = { extract, SYSTEM_PROMPT };
