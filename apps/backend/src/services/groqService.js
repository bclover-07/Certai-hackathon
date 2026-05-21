const { getGroqClient } = require("../config/groq");

const EXTRACTION_PROMPT = `You are a credential extraction AI. Extract structured credential data from the user's claim.

Respond ONLY with valid JSON:
{
  "title": "credential title",
  "issuerName": "issuing organization",
  "credentialType": "one of: medical_training, academic_credential, professional_certification, continuing_education, clinical_rotation, research_publication, workshop_seminar, license_renewal, volunteer_service",
  "hoursCompleted": number,
  "skills": ["skill1", "skill2"],
  "description": "brief description",
  "confidence": number between 0 and 1,
  "expiryYears": number or null
}`;

const withTimeout = (promise, ms = 5000, errorMessage = "Groq extraction timed out") => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), ms))
  ]);
};

const extract = async (claimText) => {
  const groq = getGroqClient();

  const completion = await withTimeout(
    groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        { role: "user", content: claimText },
      ],
      temperature: 0.2,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    }),
    5000
  );

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from Groq");
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (parseErr) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON in Groq response");
    }
    parsed = JSON.parse(jsonMatch[0]);
  }

  return parsed;
};

module.exports = { extract };
