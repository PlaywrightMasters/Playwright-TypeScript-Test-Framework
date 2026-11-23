import test from '@lib/BaseTest';
import { expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ loginPage }) => { await loginPage.navigateToURL(); });

test('submits a form using a page object', { tag: '@Smoke' }, async ({ elementsPage }) => {
    await elementsPage.enterFullName('AutoTest');
    await elementsPage.clickSubmit();
    await expect(elementsPage.SUBMITTED_TEXT).toBeVisible();
});

test('supports checkboxes and select menus', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Accept terms' }).check();
    await expect(page.getByRole('checkbox')).toBeChecked();
    await page.getByLabel('Favourite colour').selectOption('Aqua');
    await expect(page.getByRole('combobox')).toHaveValue('Aqua');
});

test('downloads and uploads files', async ({ page }, testInfo) => {
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('link', { name: 'Download sample' }).click()
    ]);
    const file = testInfo.outputPath(download.suggestedFilename());
    await download.saveAs(file);
    expect(await readFile(file, 'utf8')).toContain('Playwright Masters');
    await page.getByLabel('Upload a text file').setInputFiles(file);
    await expect(page.locator('#file-result')).toHaveText('sample.txt');
});

test('handles browser prompts', async ({ page }) => {
    page.once('dialog', dialog => dialog.accept('Hello'));
    await page.getByRole('button', { name: 'Open prompt' }).click();
    await expect(page.locator('#prompt-result')).toHaveText('You entered Hello');
});

test('mocks an API response in the browser', async ({ page }) => {
    await page.route('**/api/users?*', route => route.fulfill({ json: { data: [{ first_name: 'Mocked learner' }] } }));
    await page.getByRole('button', { name: 'Load user' }).click();
    await expect(page.locator('#network-result')).toHaveText('Mocked learner');
});

test('shows a recoverable network failure', async ({ page }) => {
    await page.route('**/api/users?*', route => route.fulfill({ status: 503, json: { error: 'Unavailable' } }));
    await page.getByRole('button', { name: 'Load user' }).click();
    await expect(page.locator('#network-result')).toHaveText('Unable to load user. Try again.');
});

test('supports keyboard submission and narrow viewports', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Full name' }).fill('Keyboard learner');
    await page.getByRole('textbox').press('Enter');
    await expect(page.locator('#result')).toHaveText('Name:Keyboard learner');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('records and replays an isolated HAR', async ({ browser, baseURL }, testInfo) => {
    const har = testInfo.outputPath('users.har');
    const recording = await browser.newContext({ baseURL, recordHar: { path: har, urlFilter: '**/api/users*', content: 'embed' } });
    try {
        const page = await recording.newPage();
        await page.goto('/');
        await page.getByRole('button', { name: 'Load user' }).click();
        await expect(page.locator('#network-result')).toHaveText('Playwright');
    } finally { await recording.close(); }
    const replay = await browser.newContext({ baseURL, serviceWorkers: 'block' });
    try {
        await replay.routeFromHAR(har, { url: '**/api/users*', notFound: 'abort' });
        const page = await replay.newPage();
        await page.goto('/');
        await page.getByRole('button', { name: 'Load user' }).click();
        await expect(page.locator('#network-result')).toHaveText('Playwright');
    } finally { await replay.close(); }
});
