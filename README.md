# Playwright API Test Framework

I built this framework to test two public REST APIs - [ReqRes](https://reqres.in) and [Restful Booker](https://restful-booker.herokuapp.com) - using Playwright's built-in API testing capabilities in Node.js.

It handles the full test lifecycle: CRUD flows, negative cases, data-driven tests, schema validation, and CI via GitHub Actions.

---

## What is tested

**Restful Booker**
- Full booking lifecycle: create, read, update (PUT + PATCH), delete
- Auth token handling - cached per session
- Negative cases: no token, wrong credentials, missing fields, non-existent IDs

**ReqRes**
- User CRUD: list (paginated), single, create, update, delete
- Negative cases: invalid IDs, empty payloads
- Data-driven: multiple user IDs and create payloads in one loop

---

## Tools used

- **@playwright/test** - test runner and API request client
- **AJV v8 + ajv-formats** - JSON Schema validation on responses
- **@faker-js/faker** - generates realistic test data per run
- **dotenv** - loads API keys from `.env` without hardcoding them

---

## Folder structure

```
api/          API client classes per service
auth/         Booker token management
config/       Base URLs and headers per environment
data/         Test data generators (Faker) and static fixtures
schemas/      JSON schemas for AJV validation
tests/api/    Spec files - booker/ and reqres/
utils/        Shared helpers: client, assertions, logger, retry, schema validator
```

---

## Setup

```bash
npm install
```

**ReqRes needs an API key.** It became a required header in late 2024. Get a free key at [app.reqres.in](https://app.reqres.in), then:

```bash
cp .env.example .env
# open .env and set REQRES_API_KEY=your_key_here
```

If the key is missing, ReqRes tests skip automatically - they do not fail.

---

## Running

```bash
npm test                  # all tests
npm run test:booker       # Booker only
npm run test:reqres       # ReqRes only - needs REQRES_API_KEY in .env
npm run report            # open HTML report in browser
```

---

## CI

Two parallel jobs in `.github/workflows/api-tests.yml` - one for each API. The HTML report is uploaded as an artifact on every run.

To run ReqRes tests in CI, add `REQRES_API_KEY` as a repository secret.

---

## API behaviour worth noting

A few things these APIs do that are not obvious from their docs:

- Restful Booker returns `201` on DELETE - not `204`. Tests account for this.
- Booker auth failure response is `{ "reason": "Bad credentials" }` - there is no `token` field in that case.
- Booker accepts a non-numeric `totalprice`, coerces it to `null`, and returns `200`. I validated the null value instead of expecting a 400.
- ReqRes now requires `x-api-key` on every request. Without it you get a `401`.
