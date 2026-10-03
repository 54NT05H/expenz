// Express 4 doesn't catch errors thrown inside async routes.
// This wrapper forwards them to our error handler instead of crashing.
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
