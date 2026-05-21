const Credential = require('../models/Credential');
const VerificationLog = require('../models/VerificationLog');
const Endorsement = require('../models/Endorsement');
const { success } = require('../utils/responseHelper');

const getPublicStats = async (req, res, next) => {
  try {
    const [credentials, verifications, endorsements] = await Promise.all([
      Credential.countDocuments({ status: 'active' }),
      VerificationLog.countDocuments(),
      Endorsement.countDocuments()
    ]);

    const hoursResult = await Credential.aggregate([
      { $group: { _id: null, total: { $sum: '$hoursCompleted' } } }
    ]);

    return res.json(success({
      credentialsMinted: credentials,
      verificationsRun: verifications,
      endorsementsGiven: endorsements,
      hoursLogged: hoursResult[0]?.total || 0
    }));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicStats
};
