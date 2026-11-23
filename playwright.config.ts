import { defineConfig, devices } from '@playwright/test';
import type { ReporterDescription } from '@playwright/test';
import { environment, testConfig } from './testConfig';

const local = environment === 'local';
const reporters: ReporterDescription[] = [
    ['list'],
    ['./CustomReporterConfig.ts'],
    ['allure-playwright', { resultsDir: 'allure-results' }],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
];
if (process.env.CI) reporters.push(['blob']);
if (process.env.ORTONI === '1') reporters.push(['ortoni-report', {
    title: 'Playwright Masters', projectName: 'TypeScript Test Framework',
    open: 'never', authorName: 'PlaywrightMasters', folderPath: 'html-report', filename: 'index'
}]);
const desktopTests = local
    ? ['**/local/UI.test.ts', '**/accessibility/*.test.ts']
    : ['**/functional/*.test.ts', '**/accessibility/*.test.ts'];
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    workers: 2,
    timeout: 60_000,
    expect: { timeout: 10_000 },
    globalSetup: './global-setup.ts',
    reporter: reporters,
    use: {
        baseURL: testConfig.baseURL, headless: true,
        locale: 'en-US', timezoneId: 'UTC',
        screenshot: 'only-on-failure', video: 'retain-on-failure', trace: 'retain-on-failure',
        actionTimeout: testConfig.waitForElement
    },
    webServer: local ? {
        command: 'node scripts/demo-server.cjs',
        url: `${testConfig.localURL}/health`,
        env: { DEMO_PORT: String(testConfig.port) },
        reuseExistingServer: false,
        timeout: 30_000
    } : undefined,
    projects: [
        { name: 'Chromium', testMatch: desktopTests, use: { ...devices['Desktop Chrome'] } },
        { name: 'Firefox', testMatch: desktopTests, use: { ...devices['Desktop Firefox'] } },
        { name: 'WebKit', testMatch: desktopTests, use: { ...devices['Desktop Safari'] } },
        { name: 'Chrome', testMatch: desktopTests, use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
        { name: 'Edge', testMatch: desktopTests, use: { ...devices['Desktop Edge'], channel: 'msedge' } },
        { name: 'Device', testMatch: local ? '**/local/UI.test.ts' : '**/devices/*.test.ts', use: { ...devices['Pixel 7'] } },
        { name: 'API', testMatch: '**/api/*.test.ts', use: { baseURL: testConfig.apiURL } },
        { name: 'Helpers', testMatch: ['**/helpers/*.test.ts', '**/functional/PdfToText.test.ts'] },
        { name: 'DB', testMatch: '**/db/*.test.ts' },
        {
            name: 'Visual', testMatch: '**/visualComparison/*.test.ts',
            use: { ...devices['Desktop Chrome'], viewport: { width: 1000, height: 720 }, deviceScaleFactor: 1 },
            snapshotPathTemplate: '{testDir}/visualComparison/snapshots/{arg}-{platform}{ext}',
            expect: { toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0.01 } }
        }
    ]
});
