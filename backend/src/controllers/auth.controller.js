import asyncHandler from 'express-async-handler';
import User from '../models/User.model.js';
import { generateToken } from '../middleware/auth.middleware.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('Email already registered');
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            targetRole: user.targetRole,
            token: generateToken(user._id),
        },
    });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    res.json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            targetRole: user.targetRole,
            token: generateToken(user._id),
        },
    });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
    res.json({ success: true, data: req.user });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, targetRole } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, targetRole },
        { new: true, runValidators: true }
    );

    res.json({ success: true, data: user });
});