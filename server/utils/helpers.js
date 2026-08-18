// Server-side utility/helper functions
// Add reusable server helpers here

/**
 * Format API response
 */
const apiResponse = (success, message, data = null) => ({
  success,
  message,
  ...(data !== null && { data }),
});

module.exports = { apiResponse };
