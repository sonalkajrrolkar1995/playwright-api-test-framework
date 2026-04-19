const logger = require('./logger');

const withRetry = async (fn, { retries = 3, delay = 1000, label = 'operation' } = {}) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) {
        logger.error(`${label} failed after ${retries} attempts`, { error: err.message });
        throw err;
      }
      logger.warn(`${label} attempt ${attempt} failed - retrying in ${delay}ms`, { error: err.message });
      await new Promise(r => setTimeout(r, delay));
    }
  }
};

module.exports = { withRetry };
