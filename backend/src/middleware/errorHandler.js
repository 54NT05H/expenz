export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

// Express recognises an error handler by its 4 parameters, so keep all 4.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }
  console.error(err); // full details stay in the server log...
  return res.status(500).json({ message: 'Something went wrong on the server' }); // ...the client gets a safe message
};
