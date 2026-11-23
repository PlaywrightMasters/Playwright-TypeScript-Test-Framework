# Playwright TypeScript Test Framework

A runnable adaptation of [Akshay Pai's Playwright TypeScript framework](https://github.com/akshayp7/playwright-typescript-playwright-test) for **PlaywrightMasters**. It retains the original page objects and examples and adds a local test target, strict TypeScript checks, portable commands, and reproducible CI.

## Quick start

Requires Node.js 22.19+ (Node.js 24 recommended).

```sh
git clone https://github.com/PlaywrightMasters/Playwright-TypeScript-Test-Framework.git
cd Playwright-TypeScript-Test-Framework
npm ci
npx playwright install chromium firefox webkit
npm run check
npm test
```

The default environment is `local`. Playwright starts and stops the bundled demo server on `127.0.0.1:4173`. No account, API key, Java installation, or database is needed for the default suite. Keep that port free, or set `DEMO_PORT`. The demo is a test fixture, not a production application.

## Included capabilities

- Page objects, typed Playwright fixtures, and path aliases.
- Chromium, Firefox, WebKit, installed Chrome/Edge, and Pixel 7 emulation.
- UI forms, selectors, dialogs, uploads/downloads, keyboard behavior, and network error handling.
- API requests with status, response-property, header, and invalid-input assertions.
- Isolated HAR recording/replay and screenshots, videos, and traces on failures.
- axe-core accessibility scans and reviewed screenshot baselines.
- PostgreSQL parameterized queries and explicit connection cleanup.
- Excel reading/writing, PDF text extraction, and awaited file helpers.
- HTML, JUnit, Allure, optional Ortoni reports, and structured Winston logs.
- Docker, two CI shards, merged HTML artifacts, and a PostgreSQL CI service.
- Lighthouse reports and token-based SonarQube configuration.

## Commands

| Command | Purpose |
| --- | --- |
| `npm test` | Chromium, API, and helper suites |
| `npm run test:all` | Chromium, Firefox, WebKit, mobile, API, and helpers |
| `npm run check` | Strict TypeScript and ESLint |
| `npm run test:smoke` | Tagged Chromium smoke cases |
| `npm run test:parallel` / `test:serial` | Four workers / one worker |
| `npm run test:api` | API tests |
| `npm run test:device` | Mobile browser emulation |
| `npm run test:accessibility` | Automated accessibility scans |
| `npm run test:helpers` | API validation, files, PDF, Excel, and database guards |
| `npm run test:db` | Live PostgreSQL test; requires DATABASE_URL |
| `npm run test:visual` | Compare a platform-specific visual baseline |
| `npm run test:visual:update` | Generate/update baselines for deliberate review |
| `npm run test:ui` / `test:debug` | Interactive runner / inspector |
| `npm run test:record` | Playwright code generator |
| `npm run report` | Open the HTML report |
| `npm run report:zip` | Archive the HTML report under reports/ |
| `npm run allureReport` | Build Allure HTML; requires Java |
| `npm run allure:open` | Open generated Allure HTML |
| `npm run lighthouse` | Audit the bundled demo and save HTML/JSON |
| `npm run demo` | Start the local demo manually |

The runner uses two workers by default. Use Playwright arguments after `--` (in PowerShell, call `npm.cmd` when forwarding extra arguments):

```sh
npm run test:single -- --grep "submits a form"
npm run test:shard -- --shard=1/2
npm run test:shard -- --shard=2/2
```

Each shard writes its own blob report. Collect those ZIP files in `all-blob-reports/` and run `npm run test:merge:reports`. Do not run overlapping test processes in the same checkout: the demo port and report directories are shared. GitHub Actions gives each shard its own checkout.

Installed branded browsers are optional: `npx playwright test --project=Chrome` or `--project=Edge`. They are not required by `npm test`.

## Environments and the original examples

Copy `.env.example` to `.env` to set local configuration. Environment variables already supplied by the shell take precedence. Never commit credentials, generated authentication state, HARs, or reports containing private data.

| ENV | UI target | API target |
| --- | --- | --- |
| local (default) | Bundled demo | Bundled demo |
| qa / qaApi | DemoQA | ReqRes |
| dev / devApi | BASE_URL required | API_BASE_URL required |

`BASE_URL` and `API_BASE_URL` can override external targets. The supplied external page objects describe DemoQA; adapting their locators and assertions is necessary for a different application. The supplied external API examples describe ReqRes.

PowerShell:

```powershell
$env:ENV = 'qa'
npm run test:single -- tests/functional/Interactions.test.ts
```

Bash:

```sh
ENV=qa npm run test:single -- tests/functional/Interactions.test.ts
```

External login examples require `TEST_USERNAME` and `TEST_PASSWORD` for an existing DemoQA test account; they are explicitly skipped when those values are absent. External API examples require `REQRES_API_KEY` and fail with a clear message when it is missing. They are not prerequisites for local CI. External websites may change, show ads, rate-limit requests, or have accessibility violations; passing local tests does not certify those third-party services.

## Structure

```text
.github/workflows/          CI shards, database check, merged reports
lib/                       Fixtures, web/API/database helpers
pageFactory/pageRepository/ Original DemoQA page objects
scripts/                   Local demo server and report archive
tests/local/               Self-contained browser and HAR examples
tests/api/                 ReqRes-compatible API and local validation
tests/helpers/             Helper regression coverage
tests/functional/          Original DemoQA and PDF examples
tests/accessibility/       axe-core scans
tests/devices/             Original external mobile example
tests/visualComparison/    Screenshot comparisons and baselines
tests/db/                  Read-only parameterized PostgreSQL query
tests/lighthouse/          Standalone performance audit
utils/                     API fixtures, sample PDF and upload image
```

## Visual baselines

Baselines include the operating system in the filename because browser rendering differs by platform. Generate a baseline on the operating system where you intend to compare, inspect the PNG/diff, then commit the accepted image. Never update snapshots automatically to make CI pass. A reviewed Windows baseline is included and checked by the Windows CI job. The general Linux CI suite does not run visual comparisons without a reviewed Linux baseline.

## Database

Set `DATABASE_URL` in `.env` to a dedicated test database, then run `npm run test:db`. The example executes `SELECT $1::text AS value`; it creates no schema and changes no rows. The helper uses bound parameters, connection/query timeouts, and closes the connection in a `finally` block. CI provisions an isolated PostgreSQL service with disposable test-only credentials. No production credentials are needed.

## Reports, audits, and containers

HTML reports appear in `playwright-report/`; JUnit, traces, videos, and screenshots in `test-results/`; Allure data in `allure-results/`; logs in `logs/`. Java is only needed to turn Allure data into the Allure HTML report. Set `ORTONI=1` to enable the optional Ortoni reporter.

`npm run report:zip` uses PowerShell Compress-Archive on Windows and the `zip` utility on Linux/macOS. Lighthouse uses Playwright's downloaded Chromium. Set `LIGHTHOUSE_URL` to audit your own authorized test URL; the default audit starts and stops the local demo.

```sh
docker build -t playwright-masters .
docker run --rm --init --ipc=host playwright-masters
```

The Docker browser version matches the pinned Playwright package. To retain reports, mount `/app/playwright-report` and `/app/test-results`. The container runs the default local suite.

SonarQube is optional: install SonarScanner, configure `SONAR_HOST_URL` and `SONAR_TOKEN` securely, then run `sonar-scanner` in this directory. No server or token is bundled. Slack notification delivery is not enabled; the CI run and report artifact links can be used with your organization's separately authorized notification integration.

## Attribution

Imported from [akshayp7/playwright-typescript-playwright-test](https://github.com/akshayp7/playwright-typescript-playwright-test) at commit `1f045e252afc1ca4d2ebe05b67dc626d2e60fd9a`. The original [MIT license](LICENSE) and copyright notice are preserved. This repository adapts the setup, dependencies, helpers, documentation, and CI; it does not claim ownership of the upstream author's work.
