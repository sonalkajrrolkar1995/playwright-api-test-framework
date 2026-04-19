const { test, expect } = require('@playwright/test');
const BookingClient = require('../../../api/booker/bookingClient');
const { generateBooking, invalidBookings } = require('../../../data/bookerData');
const { assertStatus } = require('../../../utils/assertions');

test.describe('Restful Booker - Negative Tests', () => {
  let authClient;
  let anonClient;

  test.beforeAll(async () => {
    authClient = new BookingClient();
    await authClient.init();
    await authClient.authenticate();

    anonClient = new BookingClient();
    await anonClient.init();
  });

  test.afterAll(async () => {
    await authClient.dispose();
    await anonClient.dispose();
  });

  test('DELETE /booking/:id without token - returns 403', async () => {
    const res = await anonClient.deleteBooking(1);
    assertStatus(res, 403);
  });

  test('PUT /booking/:id without token - returns 403', async () => {
    const res = await anonClient.updateBooking(1, generateBooking());
    assertStatus(res, 403);
  });

  test('PATCH /booking/:id without token - returns 403', async () => {
    const res = await anonClient.patchBooking(1, { firstname: 'Hacker' });
    assertStatus(res, 403);
  });

  test('GET /booking/999999 - non-existent ID returns 404', async () => {
    const res = await authClient.getBooking(999999);
    assertStatus(res, 404);
  });

  test('DELETE /booking/999999 - non-existent ID returns 405 or 404', async () => {
    const res = await authClient.deleteBooking(999999);
    expect([404, 405]).toContain(res.status());
  });

  test('POST /booking - missing firstname field returns 500 (Booker does not validate)', async () => {
    const res = await authClient.createBooking(invalidBookings.missingFirstname);
    // Booker returns 500 for missing required fields - known quirk of this API
    expect([400, 500]).toContain(res.status());
  });

  test('POST /booking - missing bookingdates returns 500', async () => {
    const res = await authClient.createBooking(invalidBookings.missingDates);
    expect([400, 500]).toContain(res.status());
  });

  test('POST /booking - empty body returns 500', async () => {
    const res = await authClient.createBooking(invalidBookings.emptyBody);
    expect([400, 500]).toContain(res.status());
  });

  test('POST /booking - non-numeric totalprice: Booker coerces to null and returns 200', async () => {
    const res  = await authClient.createBooking(invalidBookings.invalidPrice);
    const body = await res.json();

    // Booker does not reject invalid types - it coerces to null and accepts the record
    expect([200, 400, 500]).toContain(res.status());
    if (res.status() === 200) {
      expect(body.booking.totalprice).toBeNull();
    }
  });

  // Booker returns { "reason": "Bad credentials" } (not "token") for auth failures

  test('POST /auth - wrong password returns reason "Bad credentials"', async () => {
    const tmpClient = new BookingClient();
    await tmpClient.init();

    const res  = await tmpClient.post('/auth', {
      data: { username: 'admin', password: 'wrongpassword' },
    });
    const body = await res.json();

    assertStatus(res, 200);
    expect(body.reason).toBe('Bad credentials');

    await tmpClient.dispose();
  });

  test('POST /auth - empty body returns reason "Bad credentials"', async () => {
    const tmpClient = new BookingClient();
    await tmpClient.init();

    const res  = await tmpClient.post('/auth', { data: {} });
    const body = await res.json();

    assertStatus(res, 200);
    expect(body.reason).toBe('Bad credentials');

    await tmpClient.dispose();
  });
});
