import test from '@lib/BaseTest';
import { expect } from '@playwright/test';

test('page has no automatically detectable WCAG A/AA violations', async ({ page, makeAxeBuilder }) => {
    await page.goto('/');
    const results = await makeAxeBuilder.analyze();
    expect(results.violations).toEqual([]);
});
