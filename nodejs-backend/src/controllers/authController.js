import bcrypt from 'bcryptjs';
import { generateToken } from '../config/jwt.js';
import prisma from '../config/database.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * Register a new user
 */
export const register = asyncHandler(async (req, res) => {
  const { email, username, firstName, lastName, password } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username },
      ],
    },
  });

  if (existingUser) {
    throw new AppError(
      existingUser.email === email 
        ? 'Email already registered' 
        : 'Username already taken',
      409,
      'USER_EXISTS'
    );
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      firstName,
      lastName,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(201).json({
    message: 'User registered successfully',
    data: {
      user,
      token,
    },
  });
});

/**
 * Login user
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError('Account has been disabled', 401, 'ACCOUNT_DISABLED');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Return user data without password
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      token,
    },
  });
});

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.json({
    data: {
      user: {
        ...user,
        applicationsCount: user._count.applications,
      },
    },
  });
});

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, username } = req.body;
  const userId = req.user.id;

  // Check if username is taken by another user
  if (username) {
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      throw new AppError('Username already taken', 409, 'USERNAME_TAKEN');
    }
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(username && { username }),
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({
    message: 'Profile updated successfully',
    data: {
      user: updatedUser,
    },
  });
});

/**
 * Change password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
  }

  // Hash new password
  const saltRounds = 12;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  res.json({
    message: 'Password changed successfully',
  });
});