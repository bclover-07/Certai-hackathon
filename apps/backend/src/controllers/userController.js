const User = require('../models/User');
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
    const user = await User.findOne({ walletAddress: address.toLowerCase() });

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

    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (user) {
      return res.json(success(user, 'User already exists'));
    }

    user = await User.create({
      walletAddress: walletAddress.toLowerCase(),
      privyUserId: req.user ? req.user.privyUserId : undefined,
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
