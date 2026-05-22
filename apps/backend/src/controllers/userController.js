const User = require('../models/User');
const LeaderboardEntry = require('../models/LeaderboardEntry');
const Credential = require('../models/Credential');
const Endorsement = require('../models/Endorsement');
const VerificationLog = require('../models/VerificationLog');
const ClaimSession = require('../models/ClaimSession');
const { success, error } = require('../utils/responseHelper');

const migrateUserAddresses = async (oldAddress, newAddress) => {
  if (!oldAddress || !newAddress || oldAddress.toLowerCase() === newAddress.toLowerCase()) {
    return;
  }

  const oldLower = oldAddress.toLowerCase();
  const newLower = newAddress.toLowerCase();

  console.log(`[Address Migration] Cascading database updates from '${oldLower}' to '${newLower}'...`);

  try {
    const credResult = await Credential.updateMany(
      { holderAddress: oldLower },
      { $set: { holderAddress: newLower } }
    );
    console.log(`[Address Migration] Credentials updated: ${credResult.modifiedCount}`);

    const endRecipientResult = await Endorsement.updateMany(
      { recipientAddress: oldLower },
      { $set: { recipientAddress: newLower } }
    );
    const endEndorserResult = await Endorsement.updateMany(
      { endorserAddress: oldLower },
      { $set: { endorserAddress: newLower } }
    );
    console.log(`[Address Migration] Endorsements updated: recipient=${endRecipientResult.modifiedCount}, endorser=${endEndorserResult.modifiedCount}`);

    const verifyHolderResult = await VerificationLog.updateMany(
      { holderAddress: oldLower },
      { $set: { holderAddress: newLower } }
    );
    const verifyVerifierResult = await VerificationLog.updateMany(
      { verifierAddress: oldLower },
      { $set: { verifierAddress: newLower } }
    );
    console.log(`[Address Migration] VerificationLogs updated: holder=${verifyHolderResult.modifiedCount}, verifier=${verifyVerifierResult.modifiedCount}`);

    const sessionResult = await ClaimSession.updateMany(
      { userAddress: oldLower },
      { $set: { userAddress: newLower } }
    );
    console.log(`[Address Migration] ClaimSessions updated: ${sessionResult.modifiedCount}`);

    const oldEntry = await LeaderboardEntry.findOne({ walletAddress: oldLower });
    const newEntry = await LeaderboardEntry.findOne({ walletAddress: newLower });

    if (oldEntry && newEntry) {
      newEntry.points = Math.max(newEntry.points || 0, oldEntry.points || 0);
      if (newEntry.breakdown && oldEntry.breakdown) {
        newEntry.breakdown.credentialsMinted = Math.max(newEntry.breakdown.credentialsMinted || 0, oldEntry.breakdown.credentialsMinted || 0);
        newEntry.breakdown.endorsementsReceived = Math.max(newEntry.breakdown.endorsementsReceived || 0, oldEntry.breakdown.endorsementsReceived || 0);
        newEntry.breakdown.verificationsRun = Math.max(newEntry.breakdown.verificationsRun || 0, oldEntry.breakdown.verificationsRun || 0);
        newEntry.breakdown.hoursLogged = Math.max(newEntry.breakdown.hoursLogged || 0, oldEntry.breakdown.hoursLogged || 0);
      }
      newEntry.updatedAt = new Date();
      await newEntry.save();
      await LeaderboardEntry.deleteOne({ _id: oldEntry._id });
      console.log(`[Address Migration] Safely merged and deleted duplicate LeaderboardEntry.`);
    } else if (oldEntry && !newEntry) {
      oldEntry.walletAddress = newLower;
      oldEntry.updatedAt = new Date();
      await oldEntry.save();
      console.log(`[Address Migration] Renamed LeaderboardEntry to new wallet address.`);
    }
  } catch (err) {
    console.error(`[Address Migration] Error during address migration cascade:`, err);
  }
};

const mergeDuplicateUsersIfNeeded = async (primaryUser, targetAddress) => {
  if (!primaryUser || !targetAddress || !targetAddress.toLowerCase().startsWith('0x')) {
    return primaryUser;
  }

  const normalizedTarget = targetAddress.toLowerCase();
  const duplicateUser = await User.findOne({ walletAddress: normalizedTarget });
  
  if (duplicateUser && primaryUser._id.toString() !== duplicateUser._id.toString()) {
    console.log(`[Identity Merger] Duplicate accounts detected. Merging duplicate user '${duplicateUser._id}' into primary user '${primaryUser._id}'...`);
    
    primaryUser.stats.credentialsMinted = Math.max(primaryUser.stats?.credentialsMinted || 0, duplicateUser.stats?.credentialsMinted || 0);
    primaryUser.stats.endorsementsReceived = Math.max(primaryUser.stats?.endorsementsReceived || 0, duplicateUser.stats?.endorsementsReceived || 0);
    primaryUser.stats.verificationsRun = Math.max(primaryUser.stats?.verificationsRun || 0, duplicateUser.stats?.verificationsRun || 0);
    primaryUser.stats.totalHoursLogged = Math.max(primaryUser.stats?.totalHoursLogged || 0, duplicateUser.stats?.totalHoursLogged || 0);
    primaryUser.stats.points = Math.max(primaryUser.stats?.points || 0, duplicateUser.stats?.points || 0);
    
    if (!primaryUser.profile.displayName && duplicateUser.profile?.displayName) primaryUser.profile.displayName = duplicateUser.profile.displayName;
    if (!primaryUser.profile.organization && duplicateUser.profile?.organization) primaryUser.profile.organization = duplicateUser.profile.organization;
    if (!primaryUser.profile.specialty && duplicateUser.profile?.specialty) primaryUser.profile.specialty = duplicateUser.profile.specialty;
    if (!primaryUser.profile.bio && duplicateUser.profile?.bio) primaryUser.profile.bio = duplicateUser.profile.bio;
    if (!primaryUser.profile.avatarUrl && duplicateUser.profile?.avatarUrl) primaryUser.profile.avatarUrl = duplicateUser.profile.avatarUrl;
    if (!primaryUser.email && duplicateUser.email) primaryUser.email = duplicateUser.email;
    
    const oldAddress = primaryUser.walletAddress;
    primaryUser.walletAddress = normalizedTarget;
    primaryUser.lastActiveAt = new Date();
    
    await User.deleteOne({ _id: duplicateUser._id });
    await primaryUser.save();
    
    await migrateUserAddresses(oldAddress, normalizedTarget);
    
    console.log(`[Identity Merger] Successfully consolidated duplicate user and updated primary user.`);
  }
  
  return primaryUser;
};

const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    return res.json(success({
      users,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }));
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const { address } = req.params;
    let user = null;

    if (req.user && req.user.privyUserId) {
      user = await User.findOne({ privyUserId: req.user.privyUserId });
      
      if (user && address) {
        user = await mergeDuplicateUsersIfNeeded(user, address);
        
        if (address.toLowerCase().startsWith('0x') && user.walletAddress !== address.toLowerCase()) {
          console.log(`[Identity Consolidation] Migrating user '${user.profile.displayName}' walletAddress from '${user.walletAddress}' to newly provisioned address '${address.toLowerCase()}'`);
          const oldAddress = user.walletAddress;
          user.walletAddress = address.toLowerCase();
          user.lastActiveAt = new Date();
          await user.save();

          await migrateUserAddresses(oldAddress, address.toLowerCase());
        }
      }
    }

    if (!user && address) {
      if (address.toLowerCase().startsWith('did:privy:')) {
        user = await User.findOne({
          $or: [
            { walletAddress: address.toLowerCase() },
            { privyUserId: address }
          ]
        });
      } else {
        user = await User.findOne({ walletAddress: address.toLowerCase() });
      }
    }

    if (!user) {
      return res.status(404).json(error('User not found'));
    }

    return res.json(success(user));
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { walletAddress, email, profile } = req.body;

    if (!walletAddress) {
      return res.status(400).json(error('Wallet address is required'));
    }

    const privyUserId = req.user ? req.user.privyUserId : req.body.privyUserId;
    let user = null;

    if (privyUserId) {
      user = await User.findOne({ privyUserId });
      
      if (user) {
        user = await mergeDuplicateUsersIfNeeded(user, walletAddress);
      }
    }
    
    if (!user) {
      user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    }

    if (user) {
      let changed = false;
      if (privyUserId && user.privyUserId !== privyUserId) {
        user.privyUserId = privyUserId;
        changed = true;
      }
      
      if (walletAddress.toLowerCase().startsWith('0x') || !user.walletAddress.startsWith('0x')) {
        if (user.walletAddress !== walletAddress.toLowerCase()) {
          user.walletAddress = walletAddress.toLowerCase();
          changed = true;
        }
      }
      
      if (email && user.email !== email) {
        user.email = email;
        changed = true;
      }
      if (changed) {
        user.lastActiveAt = new Date();
        await user.save();
      }
      return res.json(success(user, 'User already exists'));
    }

    user = await User.create({
      walletAddress: walletAddress.toLowerCase(),
      privyUserId: privyUserId,
      email,
      profile: {
        displayName: profile?.displayName || `User_${walletAddress.slice(2, 8)}`,
        organization: profile?.organization || 'Self-Reported',
        specialty: profile?.specialty || 'Generalist',
        role: profile?.role || 'learner',
        avatarUrl: profile?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${walletAddress}`,
        bio: profile?.bio || ''
      },
      lastActiveAt: new Date()
    });

    await LeaderboardEntry.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      {
        $setOnInsert: {
          walletAddress: walletAddress.toLowerCase(),
          points: 0,
          rank: 0,
          breakdown: {
            credentialsMinted: 0,
            endorsementsReceived: 0,
            verificationsRun: 0,
            hoursLogged: 0,
          }
        },
        $set: {
          displayName: user.profile.displayName,
          organization: user.profile.organization,
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    return res.status(201).json(success(user, 'User onboarded successfully'));
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { address } = req.params;
    const { profile, email } = req.body;

    let user = null;
    if (req.user && req.user.privyUserId) {
      user = await User.findOne({ privyUserId: req.user.privyUserId });
      
      if (user && address) {
        user = await mergeDuplicateUsersIfNeeded(user, address);
        
        if (address.toLowerCase().startsWith('0x') && user.walletAddress !== address.toLowerCase()) {
          console.log(`[Identity Consolidation] Migrating user '${user.profile.displayName}' walletAddress from '${user.walletAddress}' to newly provisioned address '${address.toLowerCase()}'`);
          const oldAddress = user.walletAddress;
          user.walletAddress = address.toLowerCase();
          user.lastActiveAt = new Date();
          await user.save();

          await migrateUserAddresses(oldAddress, address.toLowerCase());
        }
      }
    }
    
    if (!user && address) {
      if (address.toLowerCase().startsWith('did:privy:')) {
        user = await User.findOne({
          $or: [
            { walletAddress: address.toLowerCase() },
            { privyUserId: address }
          ]
        });
      } else {
        user = await User.findOne({ walletAddress: address.toLowerCase() });
      }
    }

    if (!user) {
      return res.status(404).json(error('User not found'));
    }

    if (email) user.email = email;
    if (profile) {
      if (profile.displayName) user.profile.displayName = profile.displayName;
      if (profile.organization) user.profile.organization = profile.organization;
      if (profile.specialty) user.profile.specialty = profile.specialty;
      if (profile.role) user.profile.role = profile.role;
      if (profile.avatarUrl) user.profile.avatarUrl = profile.avatarUrl;
      if (profile.bio) user.profile.bio = profile.bio;
    }

    user.lastActiveAt = new Date();
    await user.save();

    if (profile && (profile.displayName || profile.organization)) {
      await LeaderboardEntry.findOneAndUpdate(
        { walletAddress: user.walletAddress.toLowerCase() },
        {
          $set: {
            ...(profile.displayName && { displayName: profile.displayName }),
            ...(profile.organization && { organization: profile.organization }),
            updatedAt: new Date()
          }
        }
      );
    }

    return res.json(success(user, 'User updated successfully'));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser
};
