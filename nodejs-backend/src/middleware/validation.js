import Joi from 'joi';

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: validationErrors,
        },
      });
    }

    // Replace request property with validated and sanitized value
    req[property] = value;
    next();
  };
};

// Common validation schemas
export const schemas = {
  // User schemas
  userRegistration: Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    password: Joi.string().min(6).max(128).required(),
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  userUpdate: Joi.object({
    firstName: Joi.string().min(1).max(50),
    lastName: Joi.string().min(1).max(50),
    username: Joi.string().alphanum().min(3).max(30),
    role: Joi.string().valid('USER', 'ADMIN', 'SUPER_ADMIN'),
    isActive: Joi.boolean(),
  }).min(1),

  // Application schemas
  applicationCreate: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).allow('', null),
    status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED', 'IN_REVIEW').default('PENDING'),
  }),

  applicationUpdate: Joi.object({
    name: Joi.string().min(1).max(100),
    description: Joi.string().max(500).allow('', null),
    status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED', 'IN_REVIEW'),
  }).min(1),

  // Query schemas
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().max(100).allow(''),
  }),

  // ID parameter schema
  idParam: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};