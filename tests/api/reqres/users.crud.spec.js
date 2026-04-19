require('dotenv').config();
const { test, expect } = require('@playwright/test');
const UsersClient = require('../../../api/reqres/usersClient');
const { generateUser } = require('../../../data/reqresData');
const { assertStatus, assertBodyContains, assertFieldsExist, assertStatusAndSchema } = require('../../../utils/assertions');
const {
  usersListSchema,
  singleUserSchema,
  createUserSchema,
  updateUserSchema,
} = require('../../../schemas/reqresSchemas');

test.describe('ReqRes — Users CRUD', () => {
  test.skip(!process.env.REQRES_API_KEY, 'Set REQRES_API_KEY env var — get a free key at https://app.reqres.in');

  let client;

  test.beforeAll(async () => {
    client = new UsersClient();
    await client.init();
  });

  test.afterAll(async () => {
    await client.dispose();
  });

  // ─── GET /users ───────────────────────────────────────────────────────────────
  test.describe('GET /users', () => {
    test('returns paginated user list with correct structure', async () => {
      const res  = await client.getUsers(1);
      const body = await res.json();

      assertStatus(res, 200);
      expect(body.page).toBe(1);
      expect(body.data).toBeInstanceOf(Array);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.total).toBeGreaterThan(0);
      expect(body.total_pages).toBeGreaterThan(0);
      assertStatusAndSchema(res, body, usersListSchema, 200);
    });

    test('returns page 2 with correct page metadata', async () => {
      const res  = await client.getUsers(2);
      const body = await res.json();

      assertStatus(res, 200);
      expect(body.page).toBe(2);
      expect(body.data).toBeInstanceOf(Array);
      assertStatusAndSchema(res, body, usersListSchema, 200);
    });

    test('returns empty data array for out-of-range page', async () => {
      const res  = await client.getUsers(999);
      const body = await res.json();

      assertStatus(res, 200);
      expect(body.data).toBeInstanceOf(Array);
      expect(body.data).toHaveLength(0);
    });

    test('each user in list has required fields', async () => {
      const res  = await client.getUsers(1);
      const body = await res.json();

      body.data.forEach(user => {
        assertFieldsExist(user, ['id', 'email', 'first_name', 'last_name', 'avatar']);
        expect(user.email).toMatch(/@/);
        expect(user.avatar).toMatch(/^https?:\/\//);
      });
    });
  });

  // ─── GET /users/:id ───────────────────────────────────────────────────────────
  test.describe('GET /users/:id', () => {
    test('returns correct user for ID 2', async () => {
      const res  = await client.getUser(2);
      const body = await res.json();

      assertStatus(res, 200);
      expect(body.data.id).toBe(2);
      expect(body.data.email).toBeTruthy();
      assertStatusAndSchema(res, body, singleUserSchema, 200);
    });

    test('returns 404 for non-existent user ID', async () => {
      const res = await client.getUser(9999);
      assertStatus(res, 404);
    });
  });

  // ─── POST /users ──────────────────────────────────────────────────────────────
  test.describe('POST /users', () => {
    test('creates a user and returns correct response body', async () => {
      const payload = generateUser();
      const res     = await client.createUser(payload);
      const body    = await res.json();

      assertStatus(res, 201);
      assertBodyContains(body, { name: payload.name, job: payload.job });
      assertFieldsExist(body, ['id', 'createdAt']);
      assertStatusAndSchema(res, body, createUserSchema, 201);
    });

    test('createdAt is a valid ISO timestamp', async () => {
      const res  = await client.createUser(generateUser());
      const body = await res.json();

      assertStatus(res, 201);
      expect(new Date(body.createdAt).toString()).not.toBe('Invalid Date');
    });

    test('creates user with only name field', async () => {
      const res  = await client.createUser({ name: 'Name Only' });
      const body = await res.json();

      assertStatus(res, 201);
      expect(body.name).toBe('Name Only');
      expect(body.id).toBeTruthy();
    });
  });

  // ─── PUT /users/:id ───────────────────────────────────────────────────────────
  test.describe('PUT /users/:id', () => {
    test('fully updates a user and returns updatedAt', async () => {
      const payload = generateUser();
      const res     = await client.updateUser(2, payload);
      const body    = await res.json();

      assertStatus(res, 200);
      assertBodyContains(body, { name: payload.name, job: payload.job });
      assertFieldsExist(body, ['updatedAt']);
      assertStatusAndSchema(res, body, updateUserSchema, 200);
    });

    test('updatedAt is a valid ISO timestamp', async () => {
      const res  = await client.updateUser(2, generateUser());
      const body = await res.json();

      expect(new Date(body.updatedAt).toString()).not.toBe('Invalid Date');
    });
  });

  // ─── PATCH /users/:id ─────────────────────────────────────────────────────────
  test.describe('PATCH /users/:id', () => {
    test('partially updates a user — name only', async () => {
      const res  = await client.patchUser(2, { name: 'Patch Name' });
      const body = await res.json();

      assertStatus(res, 200);
      expect(body.name).toBe('Patch Name');
      assertFieldsExist(body, ['updatedAt']);
    });

    test('partially updates a user — job only', async () => {
      const res  = await client.patchUser(2, { job: 'Patch Job' });
      const body = await res.json();

      assertStatus(res, 200);
      expect(body.job).toBe('Patch Job');
    });
  });

  // ─── DELETE /users/:id ────────────────────────────────────────────────────────
  test.describe('DELETE /users/:id', () => {
    test('deletes a user and returns 204 No Content', async () => {
      const res = await client.deleteUser(2);

      assertStatus(res, 204);
      const text = await res.text();
      expect(text).toBe('');
    });
  });
});
