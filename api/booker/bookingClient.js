const ApiClient = require('../../utils/apiClient');
const { getToken } = require('../../auth/bookerAuth');

class BookingClient extends ApiClient {
  async init() {
    return super.init('booker');
  }

  async authenticate() {
    const token = await getToken();
    this.setToken(token);
    return this;
  }

  getBookings(filters = {}) {
    return this.get('/booking', { params: filters });
  }

  getBooking(id) {
    return this.get(`/booking/${id}`);
  }

  createBooking(data) {
    return this.post('/booking', { data });
  }

  updateBooking(id, data) {
    return this.put(`/booking/${id}`, { data });
  }

  patchBooking(id, data) {
    return this.patch(`/booking/${id}`, { data });
  }

  deleteBooking(id) {
    return this.delete(`/booking/${id}`);
  }
}

module.exports = BookingClient;
