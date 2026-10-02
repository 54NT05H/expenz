// Turns an axios error into a message a person can read.
export const getErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  // No response at all = the request never reached the server
  if (!err?.response) {
    return 'Cannot reach the server. Is the backend running?';
  }
  // Our backend always replies { message: '...' } on errors
  return err.response.data?.message || fallback;
};
