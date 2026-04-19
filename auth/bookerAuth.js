const ApiClient = require('../utils/apiClient');
const logger = require('../utils/logger');

let _cachedToken = null;

const getToken = async () => {
  if (_cachedToken) {
    logger.info('Using cached Booker auth token');
    return _cachedToken;
  }

  const client = new ApiClient();
  await client.init('booker');

  const res = await client.post('/auth', {
    data: { username: 'admin', password: 'password123' },
  });

  if (!res.ok()) {
    throw new Error(`Booker auth failed - status ${res.status()}`);
  }

  const body = await res.json();

  if (!body.token || body.reason === 'Bad credentials') {
    throw new Error(`Booker auth failed: ${body.reason || 'no token returned'}`);
  }

  _cachedToken = body.token;
  logger.info('Booker auth token acquired and cached');

  await client.dispose();
  return _cachedToken;
};

const clearToken = () => {
  _cachedToken = null;
};

module.exports = { getToken, clearToken };
