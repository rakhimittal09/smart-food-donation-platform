// Utility/helper functions for the Smart Food Donation Platform

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

/**
 * Truncate a string to a max length
 */
export const truncate = (str, maxLength = 80) => {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};
