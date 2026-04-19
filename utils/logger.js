const _log = (level, message, data) => {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase().padEnd(8)}]`;
  if (data !== undefined) {
    console.log(`${prefix} ${message}\n`, JSON.stringify(data, null, 2));
  } else {
    console.log(`${prefix} ${message}`);
  }
};

const logger = {
  info:  (msg, data) => _log('info',  msg, data),
  warn:  (msg, data) => _log('warn',  msg, data),
  error: (msg, data) => _log('error', msg, data),

  request(method, url, options = {}) {
    _log('request', `>>> ${method.toUpperCase()} ${url}`, {
      headers: options.headers ?? null,
      params:  options.params  ?? null,
      body:    options.data    ?? options.form ?? null,
    });
  },

  response(method, url, status, body) {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    _log(level, `<<< ${status} ${method.toUpperCase()} ${url}`, body);
  },
};

module.exports = logger;
