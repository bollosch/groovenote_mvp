/**
 * Formats seconds into MM:SS display format
 * @param {number} seconds - The number of seconds to format
 * @returns {string} Formatted time string in MM:SS format
 */
export const formatTime = (seconds) => {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}; 