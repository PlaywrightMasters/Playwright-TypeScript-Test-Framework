# Contributing

Use a feature branch and open a pull request against main. Keep credentials and generated reports out of commits.

1. Install Node.js 24, run npm ci, and install the Playwright browsers.
2. Run npm run check and npm run test:all.
3. Add meaningful coverage for changed behavior. Use isolated browser contexts, awaited locators, and per-test output paths.
4. Review screenshot changes explicitly; never regenerate snapshots merely to silence a regression.
5. Describe external-service prerequisites and distinguish local verification from external tests.

Keep the MIT attribution when adapting imported code. CI must pass before merging.
