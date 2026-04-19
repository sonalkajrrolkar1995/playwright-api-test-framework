const { request } = require('@playwright/test');
const logger = require('./logger');
const environments = require('../config/environments');

class ApiClient {
  constructor() {
    this._context = null;
    this._token = null;
  }

  async init(envName) {
    const env = environments[envName] || {};
    this._context = await request.newContext({
      baseURL: env.baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(env.headers || {}),
      },
    });
    return this;
  }

  setToken(token) {
    this._token = token;
    return this;
  }

  _withAuth(options = {}) {
    if (!this._token) return options;
    return {
      ...options,
      headers: {
        ...options.headers,
        Cookie: `token=${this._token}`,
      },
    };
  }

  async get(path, options = {}) {
    logger.request('GET', path, options);
    const res = await this._context.get(path, this._withAuth(options));
    await this._logResponse('GET', path, res);
    return res;
  }

  async post(path, options = {}) {
    logger.request('POST', path, options);
    const res = await this._context.post(path, this._withAuth(options));
    await this._logResponse('POST', path, res);
    return res;
  }

  async put(path, options = {}) {
    logger.request('PUT', path, options);
    const res = await this._context.put(path, this._withAuth(options));
    await this._logResponse('PUT', path, res);
    return res;
  }

  async patch(path, options = {}) {
    logger.request('PATCH', path, options);
    const res = await this._context.patch(path, this._withAuth(options));
    await this._logResponse('PATCH', path, res);
    return res;
  }

  async delete(path, options = {}) {
    logger.request('DELETE', path, options);
    const res = await this._context.delete(path, this._withAuth(options));
    await this._logResponse('DELETE', path, res);
    return res;
  }

  async _logResponse(method, path, res) {
    let body;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    logger.response(method, path, res.status(), body);
  }

  async dispose() {
    if (this._context) {
      await this._context.dispose();
      this._context = null;
    }
  }
}

module.exports = ApiClient;
