import prisma from '../config/database.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all applications
 */
export const getApplications = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search } = req.query;
  
  const skip = (page - 1) * limit;
  
  // Build where clause
  let where = {};
  
  // If not admin, only show user's own applications
  if (req.user.role === 'USER') {
    where.userId = req.user.id;
  }
  
  // Add search filter
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Get applications with pagination
  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.application.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    data: {
      applications,
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
 * Get application by ID
 */
export const getApplicationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const applicationId = parseInt(id);

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          username: true,
        },
      },
    },
  });

  if (!application) {
    throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND');
  }

  // Check if user can access this application
  if (req.user.role === 'USER' && application.userId !== req.user.id) {
    throw new AppError('Access denied', 403, 'ACCESS_DENIED');
  }

  res.json({
    data: {
      application,
    },
  });
});

/**
 * Create new application
 */
export const createApplication = asyncHandler(async (req, res) => {
  const { name, description, status = 'PENDING' } = req.body;
  const userId = req.user.id;

  const application = await prisma.application.create({
    data: {
      name,
      description,
      status,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          username: true,
        },
      },
    },
  });

  res.status(201).json({
    message: 'Application created successfully',
    data: {
      application,
    },
  });
});

/**
 * Update application
 */
export const updateApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const applicationId = parseInt(id);
  const updateData = req.body;

  // Check if application exists
  const existingApplication = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!existingApplication) {
    throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND');
  }

  // Check permissions
  if (req.user.role === 'USER' && existingApplication.userId !== req.user.id) {
    throw new AppError('Access denied', 403, 'ACCESS_DENIED');
  }

  // Users can only update name and description, not status
  if (req.user.role === 'USER') {
    delete updateData.status;
  }

  const updatedApplication = await prisma.application.update({
    where: { id: applicationId },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          username: true,
        },
      },
    },
  });

  res.json({
    message: 'Application updated successfully',
    data: {
      application: updatedApplication,
    },
  });
});

/**
 * Delete application
 */
export const deleteApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const applicationId = parseInt(id);

  // Check if application exists
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND');
  }

  // Check permissions
  if (req.user.role === 'USER' && application.userId !== req.user.id) {
    throw new AppError('Access denied', 403, 'ACCESS_DENIED');
  }

  await prisma.application.delete({
    where: { id: applicationId },
  });

  res.json({
    message: 'Application deleted successfully',
  });
});

/**
 * Get application statistics (Admin only)
 */
export const getApplicationStats = asyncHandler(async (req, res) => {
  const stats = await prisma.application.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  });

  const totalApplications = await prisma.application.count();
  const recentApplications = await prisma.application.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
  });

  const statusCounts = stats.reduce((acc, stat) => {
    acc[stat.status.toLowerCase()] = stat._count.status;
    return acc;
  }, {});

  res.json({
    data: {
      total: totalApplications,
      recent: recentApplications,
      byStatus: statusCounts,
    },
  });
});