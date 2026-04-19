require('dotenv').config();
const { test, expect } = require('@playwright/test');
const UsersClient = require('../../../api/reqres/usersClient');
const { generateUser, userIds } = require('../../../data/reqresData');
const { assertStatus, assertBodyContains } = require('../../../utils/assertions');
const { singleUserSchema } = require('../../../schemas/reqresSchemas');
const { validateSchema } = require('../../../utils/schemaValidator');

test.describe('ReqRes — Data-Driven Tests', () => {
  test.skip(!process.env.REQRES_API_KEY, 'Set REQRES_API_KEY env var — get a free key at https://app.reqres.in');

  let client;

  test.beforeAll(async () => {
    client = new UsersClient();
    await client.init();
  });

  test.afterAll(async () => {
    await client.dispose();
  });

  // ─── Valid user IDs ────────────────────────────────────────────────────────────
  for (const id of userIds.valid) {
    test(`GET /users/${id} — valid user returns 200 with correct schema`, async () => {
      const res  = await client.getUser(id);
      const body = await res.json();

      assertStatus(res, 200);
      expect(body.data.id).toBe(id);
      validateSchema(singleUserSchema, body);
    });
  }

  // ─── Invalid user IDs ─────────────────────────────────────────────────────────
  for (const id of userIds.nonExistent) {
    test(`GET /users/${id} — non-existent ID returns 404`, async () => {
      const res = await client.getUser(id);
      assertStatus(res, 404);
    });
  }

  // ─── POST with varied payloads ─────────────────────────────────────────────────
  const createCases = [
    { label: 'job title "Engineer"',  payload: { name: 'Alice',  job: 'Engineer'  } },
    { label: 'job title "Designer"',  payload: { name: 'Bob',    job: 'Designer'  } },
    { label: 'job title "QA Lead"',   payload: { name: 'Carol',  job: 'QA Lead'   } },
    { label: 'unicode name',          payload: { name: 'Ñoño',   job: 'Tester'    } },
    { label: 'name with spaces',      payload: { name: 'Mary Jane Watson', job: 'Hero' } },
  ];

  for (const { label, payload } of createCases) {
    test(`POST /users — ${label}`, async () => {
      const res  = await client.createUser(payload);
      const body = await res.json();

      assertStatus(res, 201);
      assertBodyContains(body, { name: payload.name, job: payload.job });
      expect(body.id).toBeTruthy();
    });
  }

  // ─── Page-level pagination ─────────────────────────────────────────────────────
  const pages = [1, 2];

  for (const page of pages) {
    test(`GET /users?page=${page} — returns correct page number`, async () => {
      const res  = await client.getUsers(page);
      const body = await res.json();

      assertStatus(res, 200);
      expect(body.page).toBe(page);
      expect(body.data.length).toBeGreaterThan(0);
    });
  }
});
