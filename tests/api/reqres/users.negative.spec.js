require('dotenv').config();
const { test, expect } = require('@playwright/test');
const UsersClient = require('../../../api/reqres/usersClient');
const { invalidPayloads } = require('../../../data/reqresData');
const { assertStatus } = require('../../../utils/assertions');

test.describe('ReqRes - Users Negative Tests', () => {
  test.skip(!process.env.REQRES_API_KEY, 'Set REQRES_API_KEY env var - get a free key at https://app.reqres.in');

  let client;

  test.beforeAll(async () => {
    client = new UsersClient();
    await client.init();
  });

  test.afterAll(async () => {
    await client.dispose();
  });

  test('GET /users/9999 - non-existent user returns 404', async () => {
    const res = await client.getUser(9999);
    assertStatus(res, 404);
  });

  test('GET /users/0 - ID 0 returns 404', async () => {
    const res = await client.getUser(0);
    assertStatus(res, 404);
  });

  test('GET /users/99998 - large non-existent ID returns 404', async () => {
    const res = await client.getUser(99998);
    assertStatus(res, 404);
  });

  test('GET /users/9999 - 404 body is empty object', async () => {
    const res  = await client.getUser(9999);
    const body = await res.json();

    assertStatus(res, 404);
    expect(Object.keys(body)).toHaveLength(0);
  });

  // ReqRes is a mock - it accepts any POST payload and returns 201

  test('POST /users - empty body returns 201 (ReqRes is lenient)', async () => {
    const res  = await client.createUser(invalidPayloads.emptyBody);
    const body = await res.json();

    assertStatus(res, 201);
    expect(body.id).toBeTruthy();
    expect(body.createdAt).toBeTruthy();
  });

  test('POST /users - null name returns 201 (ReqRes does not validate)', async () => {
    const res = await client.createUser(invalidPayloads.nullName);
    assertStatus(res, 201);
  });

  test('POST /users - numeric name echoed back as-is', async () => {
    const res  = await client.createUser(invalidPayloads.numericName);
    const body = await res.json();

    assertStatus(res, 201);
    expect(body.name).toBe(invalidPayloads.numericName.name);
  });

  // ReqRes returns 200/204 for any ID regardless - no existence check on their end

  test('PUT /users/9999 - mock API returns 200 for non-existent ID', async () => {
    const res = await client.updateUser(9999, { name: 'Ghost', job: 'None' });
    assertStatus(res, 200);
  });

  test('DELETE /users/9999 - mock API returns 204 for non-existent ID', async () => {
    const res = await client.deleteUser(9999);
    assertStatus(res, 204);
  });
});
