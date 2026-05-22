const User = require('../models/User');
const LeaderboardEntry = require('../models/LeaderboardEntry');
const { success, error } = require('../utils/responseHelper');

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
    let user = await User.findOne({ walletAddress: address.toLowerCase() });

    // Fallback: If address not found, check if privyUserId is active to consolidate identity
    if (!user && req.user && req.user.privyUserId) {
      user = await User.findOne({ privyUserId: req.user.privyUserId });
      if (user) {
        const oldAddress = user.walletAddress;
        user.walletAddress = address.toLowerCase();
        user.lastActiveAt = new Date();
        await user.save();

        // Rename the leaderboard entry address to keep the point history and rank intact
        await LeaderboardEntry.findOneAndUpdate(
          { walletAddress: oldAddress.toLowerCase() },
          { $set: { walletAddress: address.toLowerCase(), updatedAt: new Date() } }
        );
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
    }
    if (!user) {
      user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    }

    if (user) {
      // If the user logs in with a new active wallet linked to their Privy profile, update it
      if (user.walletAddress !== walletAddress.toLowerCase()) {
        user.walletAddress = walletAddress.toLowerCase();
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

    // Seed default LeaderboardEntry immediately so they show up on the ladder instantly
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

    const user = await User.findOne({ walletAddress: address.toLowerCase() });
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
        { walletAddress: address.toLowerCase() },
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
