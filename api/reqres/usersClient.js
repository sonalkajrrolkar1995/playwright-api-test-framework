const ApiClient = require('../../utils/apiClient');

class UsersClient extends ApiClient {
  async init() {
    return super.init('reqres');
  }

  getUsers(page = 1) {
    return this.get('/api/users', { params: { page } });
  }

  getUser(id) {
    return this.get(`/api/users/${id}`);
  }

  createUser(data) {
    return this.post('/api/users', { data });
  }

  updateUser(id, data) {
    return this.put(`/api/users/${id}`, { data });
  }

  patchUser(id, data) {
    return this.patch(`/api/users/${id}`, { data });
  }

  deleteUser(id) {
    return this.delete(`/api/users/${id}`);
  }
}

module.exports = UsersClient;
