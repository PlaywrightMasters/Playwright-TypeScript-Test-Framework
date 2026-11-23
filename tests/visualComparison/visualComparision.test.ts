import { test, expect } from '@playwright/test';
import { environment } from '../../testConfig';

test('page matches the reviewed visual baseline', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot(`${environment}-main.png`, { fullPage: true });
});
