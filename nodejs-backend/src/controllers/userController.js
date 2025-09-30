import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all users (Admin only)
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search } = req.query;
  
  const skip = (page - 1) * limit;
  
  // Build where clause for search
  const where = search ? {
    OR: [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } },
    ],
  } : {};

  // Get users with pagination
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    data: {
      users: users.map(user => ({
        ...user,
        applicationsCount: user._count.applications,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
});

/**
 * Get user by ID
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
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
      applications: {
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
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
 * Create new user (Admin only)
 */
export const createUser = asyncHandler(async (req, res) => {
  const { email, username, firstName, lastName, password, role = 'USER' } = req.body;

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
      role,
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

  res.status(201).json({
    message: 'User created successfully',
    data: {
      user,
    },
  });
});

/**
 * Update user (Admin only)
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Check if username is taken by another user
  if (updateData.username) {
    const existingUser = await prisma.user.findFirst({
      where: {
        username: updateData.username,
        NOT: { id: parseInt(id) },
      },
    });

    if (existingUser) {
      throw new AppError('Username already taken', 409, 'USERNAME_TAKEN');
    }
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: parseInt(id) },
    data: updateData,
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
    message: 'User updated successfully',
    data: {
      user: updatedUser,
    },
  });
});

/**
 * Delete user (Admin only)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = parseInt(id);

  // Prevent deleting self
  if (userId === req.user.id) {
    throw new AppError('Cannot delete your own account', 400, 'CANNOT_DELETE_SELF');
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Prevent deleting super admin (unless requester is super admin)
  if (user.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    throw new AppError('Cannot delete super admin', 403, 'FORBIDDEN');
  }

  // Delete user (cascade will handle related records)
  await prisma.user.delete({
    where: { id: userId },
  });

  res.json({
    message: 'User deleted successfully',
  });
});

/**
 * Toggle user active status (Admin only)
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = parseInt(id);

  // Prevent disabling self
  if (userId === req.user.id) {
    throw new AppError('Cannot disable your own account', 400, 'CANNOT_DISABLE_SELF');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Prevent disabling super admin
  if (user.role === 'SUPER_ADMIN') {
    throw new AppError('Cannot disable super admin', 403, 'FORBIDDEN');
  }

  // Toggle status
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  res.json({
    message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      user: updatedUser,
    },
  });
});