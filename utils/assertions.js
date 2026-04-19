const { expect } = require('@playwright/test');
const { validateSchema } = require('./schemaValidator');

const assertStatus = (response, expected) => {
  expect(response.status(), `Expected HTTP ${expected} but got ${response.status()}`).toBe(expected);
};

const assertBodyContains = (body, fields) => {
  for (const [key, value] of Object.entries(fields)) {
    expect(body[key], `Expected body.${key} to equal ${JSON.stringify(value)}`).toBe(value);
  }
};

const assertFieldsExist = (body, fields) => {
  for (const field of fields) {
    expect(body, `Expected field "${field}" to exist`).toHaveProperty(field);
    expect(body[field], `Expected body.${field} to be non-null`).not.toBeNull();
    expect(body[field], `Expected body.${field} to be defined`).toBeDefined();
  }
};

const assertSchema = (body, schema) => {
  validateSchema(schema, body);
};

const assertStatusAndSchema = (response, body, schema, expectedStatus = 200) => {
  assertStatus(response, expectedStatus);
  assertSchema(body, schema);
};

module.exports = {
  assertStatus,
  assertBodyContains,
  assertFieldsExist,
  assertSchema,
  assertStatusAndSchema,
};
