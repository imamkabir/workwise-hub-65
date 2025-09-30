/**
 * 404 Not Found middleware
 * Handles requests to non-existent endpoints
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      details: {
        method: req.method,
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      },
    },
  });
};