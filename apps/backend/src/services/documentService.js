const { getGeminiModel } = require('../config/gemini');
const { HumanMessage } = require('@langchain/core/messages');

const withTimeout = (promise, ms = 30000, errorMessage = 'Document analysis timed out') => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), ms))
  ]);
};

const analyzeDocument = async (base64Data, mimeType, claimedTitle, claimedIssuer) => {
  const fallbackResult = {
    ocrText: '',
    logoDetected: false,
    issuerNameMatch: false,
    titleMatch: false,
    dateFound: null,
    fraudIndicators: [],
    documentConfidence: 0.3,
    analysisMethod: 'fallback'
  };

  try {
    const model = getGeminiModel();

    const prompt = `You are an expert document verification AI for a credentialing platform called CERTAI.

Analyze this uploaded certificate/credential document image. The user claims this is for:
- Title: "${claimedTitle}"
- Issuer: "${claimedIssuer}"

Perform the following analysis and respond ONLY with valid JSON:
{
  "ocrText": "string - all readable text extracted from the document",
  "logoDetected": boolean - whether an institutional logo, seal, or official emblem is visible,
  "issuerNameMatch": boolean - whether the document text contains or closely matches the claimed issuer "${claimedIssuer}",
  "titleMatch": boolean - whether the document text contains or closely matches the claimed title "${claimedTitle}",
  "dateFound": "string or null - any completion/issue date found in the document (ISO format if possible)",
  "fraudIndicators": ["array of strings - any suspicious patterns: low resolution, digital artifacts, missing watermarks, inconsistent fonts, template-looking, etc. Empty array if none found"],
  "documentConfidence": number between 0 and 1 - your overall confidence that this is a genuine, authentic document for the claimed credential
}

Be strict but fair. A simple course completion certificate is fine. Look for genuine signs of authenticity.`;

    const imageContent = {
      type: 'image_url',
      image_url: {
        url: `data:${mimeType};base64,${base64Data.substring(0, 500000)}`
      }
    };

    const response = await withTimeout(
      model.invoke([
        new HumanMessage({
          content: [
            { type: 'text', text: prompt },
            imageContent
          ]
        })
      ]),
      30000
    );

    const content = response.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in Gemini Vision response for document analysis');
      return fallbackResult;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      ocrText: parsed.ocrText || '',
      logoDetected: !!parsed.logoDetected,
      issuerNameMatch: !!parsed.issuerNameMatch,
      titleMatch: !!parsed.titleMatch,
      dateFound: parsed.dateFound || null,
      fraudIndicators: Array.isArray(parsed.fraudIndicators) ? parsed.fraudIndicators : [],
      documentConfidence: typeof parsed.documentConfidence === 'number'
        ? Math.max(0, Math.min(1, parsed.documentConfidence))
        : 0.5,
      analysisMethod: 'gemini-vision'
    };
  } catch (err) {
    console.error('Document analysis error:', err.message);
    return {
      ...fallbackResult,
      fraudIndicators: [`Analysis failed: ${err.message}`]
    };
  }
};

module.exports = { analyzeDocument };
