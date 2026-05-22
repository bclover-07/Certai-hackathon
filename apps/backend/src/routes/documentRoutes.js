const router = require('express').Router();
const Credential = require('../models/Credential');
const { analyzeDocument } = require('../services/documentService');
const { recomputeAndSave } = require('../services/trustScoreService');
const auth = require('../middlewares/auth');
const { success, error } = require('../utils/responseHelper');

router.post('/verify', auth, async (req, res, next) => {
  try {
    const { credentialId, documentBase64, mimeType } = req.body;

    if (!credentialId || !documentBase64 || !mimeType) {
      return res.status(400).json(error('credentialId, documentBase64, and mimeType are required'));
    }

    const credential = await Credential.findById(credentialId);
    if (!credential) {
      return res.status(404).json(error('Credential not found'));
    }

    // Call document analysis service
    const analysis = await analyzeDocument(documentBase64, mimeType, credential.title, credential.issuerName);

    // Save results
    credential.documentVerification = {
      uploaded: true,
      documentData: documentBase64.substring(0, 500000), // Limit size stored
      mimeType,
      ocrText: analysis.ocrText,
      logoDetected: analysis.logoDetected,
      issuerNameMatch: analysis.issuerNameMatch,
      titleMatch: analysis.titleMatch,
      fraudIndicators: analysis.fraudIndicators,
      documentConfidence: analysis.documentConfidence,
      analyzedAt: new Date()
    };

    // If document confidence is very high, we can also upgrade trustLevel to ai_verified if it's currently self_claimed
    if (analysis.documentConfidence >= 0.7 && credential.trustLevel === 'self_claimed') {
      credential.trustLevel = 'ai_verified';
      credential.trustLevelHistory.push({
        level: 'ai_verified',
        changedBy: 'system',
        changedAt: new Date(),
        reason: 'Upgraded via Document AI analysis verification'
      });
    }

    await credential.save();

    // Recalculate trust score
    try {
      await recomputeAndSave(credential);
    } catch (e) {
      console.error('Failed to recompute trust score on document upload:', e.message);
    }

    return res.json(success({
      credential,
      analysis
    }, 'Document uploaded and analyzed successfully'));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
