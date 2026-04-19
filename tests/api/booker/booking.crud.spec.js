const { test, expect } = require('@playwright/test');
const BookingClient = require('../../../api/booker/bookingClient');
const { generateBooking } = require('../../../data/bookerData');
const { assertStatus, assertBodyContains, assertFieldsExist, assertStatusAndSchema } = require('../../../utils/assertions');
const {
  createBookingResponseSchema,
  bookingDetailsSchema,
  bookingListItemSchema,
} = require('../../../schemas/bookerSchemas');
const { validateSchema } = require('../../../utils/schemaValidator');

// Serial so each test can depend on the bookingId created in the first test.
test.describe.serial('Restful Booker — Booking CRUD Flow', () => {
  let client;
  let bookingId;
  let originalBooking;

  test.beforeAll(async () => {
    client = new BookingClient();
    await client.init();
    await client.authenticate();
  });

  test.afterAll(async () => {
    await client.dispose();
  });

  // ─── GET /booking ─────────────────────────────────────────────────────────────
  test('GET /booking — returns non-empty list of booking IDs', async () => {
    const res  = await client.getBookings();
    const body = await res.json();

    assertStatus(res, 200);
    expect(body).toBeInstanceOf(Array);
    expect(body.length).toBeGreaterThan(0);
    body.slice(0, 5).forEach(item => validateSchema(bookingListItemSchema, item));
  });

  test('GET /booking?firstname=Sally — filters by firstname', async () => {
    const res  = await client.getBookings({ firstname: 'Sally' });
    const body = await res.json();

    assertStatus(res, 200);
    expect(body).toBeInstanceOf(Array);
  });

  test('GET /booking?checkin=2024-01-01 — filters by checkin date', async () => {
    const res  = await client.getBookings({ checkin: '2024-01-01' });
    const body = await res.json();

    assertStatus(res, 200);
    expect(body).toBeInstanceOf(Array);
  });

  // ─── POST /booking ────────────────────────────────────────────────────────────
  test('POST /booking — creates booking and returns ID + full details', async () => {
    originalBooking = generateBooking();
    const res       = await client.createBooking(originalBooking);
    const body      = await res.json();

    assertStatus(res, 200);
    expect(body.bookingid).toBeTruthy();
    expect(typeof body.bookingid).toBe('number');
    assertBodyContains(body.booking, {
      firstname:   originalBooking.firstname,
      lastname:    originalBooking.lastname,
      totalprice:  originalBooking.totalprice,
      depositpaid: originalBooking.depositpaid,
    });
    assertStatusAndSchema(res, body, createBookingResponseSchema, 200);

    bookingId = body.bookingid;
  });

  // ─── GET /booking/:id ─────────────────────────────────────────────────────────
  test('GET /booking/:id — retrieves the created booking', async () => {
    const res  = await client.getBooking(bookingId);
    const body = await res.json();

    assertStatus(res, 200);
    assertBodyContains(body, {
      firstname:   originalBooking.firstname,
      lastname:    originalBooking.lastname,
      totalprice:  originalBooking.totalprice,
      depositpaid: originalBooking.depositpaid,
    });
    expect(body.bookingdates.checkin).toBe(originalBooking.bookingdates.checkin);
    expect(body.bookingdates.checkout).toBe(originalBooking.bookingdates.checkout);
    assertStatusAndSchema(res, body, bookingDetailsSchema, 200);
  });

  // ─── PUT /booking/:id ─────────────────────────────────────────────────────────
  test('PUT /booking/:id — fully replaces booking', async () => {
    const updated = generateBooking();
    const res     = await client.updateBooking(bookingId, updated);
    const body    = await res.json();

    assertStatus(res, 200);
    assertBodyContains(body, {
      firstname:   updated.firstname,
      lastname:    updated.lastname,
      totalprice:  updated.totalprice,
      depositpaid: updated.depositpaid,
    });
    assertStatusAndSchema(res, body, bookingDetailsSchema, 200);

    originalBooking = updated;
  });

  // ─── PATCH /booking/:id ───────────────────────────────────────────────────────
  test('PATCH /booking/:id — partially updates firstname and lastname', async () => {
    const res  = await client.patchBooking(bookingId, {
      firstname: 'PatchedFirst',
      lastname:  'PatchedLast',
    });
    const body = await res.json();

    assertStatus(res, 200);
    expect(body.firstname).toBe('PatchedFirst');
    expect(body.lastname).toBe('PatchedLast');
    // Unchanged fields should persist
    expect(body.totalprice).toBe(originalBooking.totalprice);
    assertStatusAndSchema(res, body, bookingDetailsSchema, 200);
  });

  test('PATCH /booking/:id — partially updates totalprice only', async () => {
    const res  = await client.patchBooking(bookingId, { totalprice: 1 });
    const body = await res.json();

    assertStatus(res, 200);
    expect(body.totalprice).toBe(1);
  });

  // ─── DELETE /booking/:id ──────────────────────────────────────────────────────
  test('DELETE /booking/:id — returns 201 Created (Booker quirk)', async () => {
    const res  = await client.deleteBooking(bookingId);
    const text = await res.text();

    assertStatus(res, 201);
    expect(text).toBe('Created');
  });

  test('GET /booking/:id — returns 404 after deletion', async () => {
    const res = await client.getBooking(bookingId);
    assertStatus(res, 404);
  });
});
