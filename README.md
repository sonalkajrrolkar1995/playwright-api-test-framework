# Playwright API Test Framework

API test framework built with Playwright (Node.js). Covers CRUD, negative, and data-driven tests for two public REST APIs — [ReqRes](https://reqres.in) and [Restful Booker](https://restful-booker.herokuapp.com).

---

## What it covers

- Full CRUD flows with shared state (create → read → update → delete)
- Negative tests: unauthorized access, missing fields, invalid payloads, non-existent resources
- Data-driven tests using [@faker-js/faker](https://github.com/faker-js/faker)
- JSON Schema validation using [AJV](https://ajv.js.org/)
- Custom assertions and a retry helper
- Structured console logging (timestamped, per request/response)
- Parallel execution, HTML report, GitHub Actions CI

---

## Tech stack

| Tool | Purpose |
|---|---|
| [@playwright/test](https://playwright.dev/docs/api-testing) | Test runner + API request context |
| [AJV v8](https://ajv.js.org/) + [ajv-formats](https://github.com/ajv-validator/ajv-formats) | Schema validation |
| [@faker-js/faker](https://github.com/faker-js/faker) | Dynamic test data |
| [dotenv](https://github.com/motdotla/dotenv) | Environment variable management |

---

## Project structure

```
├── api/                    # API client wrappers (per service)
│   └── booker/
├── auth/                   # Auth token management
├── config/                 # Base URLs and env-level headers
├── data/                   # Test data generators and fixtures
├── schemas/                # AJV JSON schemas
├── tests/
│   └── api/
│       ├── booker/         # Booker CRUD, negative tests
│       └── reqres/         # ReqRes CRUD, negative, data-driven
├── utils/                  # Shared: client, assertions, logger, retry, schema validator
├── .env.example
├── playwright.config.js
└── package.json
```

---

## Setup

```bash
npm install
```

### ReqRes API key

ReqRes requires a free API key. Register at [app.reqres.in](https://app.reqres.in), then:

```bash
cp .env.example .env
# Edit .env and set REQRES_API_KEY=your_key
```

Without the key, all ReqRes tests skip cleanly with a descriptive message.

---

## Running tests

```bash
# All tests
npm test

# Booker only
npm run test:booker

# ReqRes only (requires REQRES_API_KEY in .env)
npm run test:reqres

# Open HTML report
npm run report
```

---

## CI/CD

GitHub Actions workflow at `.github/workflows/api-tests.yml`. Runs ReqRes and Booker suites as parallel jobs. HTML report is uploaded as an artifact on every run.

Set `REQRES_API_KEY` as a repository secret to enable ReqRes tests in CI.

---

## Known API quirks documented in tests

| API | Behaviour |
|---|---|
| Restful Booker | `DELETE /booking/:id` returns `201` (not `204`) |
| Restful Booker | Auth failure returns `{ "reason": "Bad credentials" }` — not a token field |
| Restful Booker | Non-numeric `totalprice` is coerced to `null`, request returns `200` |
| ReqRes | Requires `x-api-key` header since late 2024 |
