import test from '@lib/BaseTest';
import { expect } from '@playwright/test';
import { APIActions } from '@lib/APIActions';
import { DBActions } from '@lib/DBActions';
import { Workbook } from 'exceljs';

test('response validation accepts actual nested properties', async () => {
    await new APIActions().verifyResponseBody('page|id|email', { page: 1, data: [{ id: 1, email: 'learner@example.test' }] }, 'body');
});
test('response validation rejects a key that exists only as a value', async () => {
    await expect(new APIActions().verifyResponseBody('email', { message: 'email' }, 'body')).rejects.toThrow();
});
test('header validation is case insensitive and detects missing headers', async () => {
    const helper = new APIActions();
    await helper.verifyResponseHeader('content-type', [{ name: 'Content-Type', value: 'application/json' }], 'headers');
    await expect(helper.verifyResponseHeader('x-missing', [], 'headers')).rejects.toThrow();
});
test('file writes finish before a subsequent read', async ({ webActions }, testInfo) => {
    const file = testInfo.outputPath('example.txt');
    await webActions.writeDataIntoTextFile(file, 'awaited write');
    expect(await webActions.readValuesFromTextFile(file)).toBe('awaited write');
});
test('reads Excel values and reports a missing worksheet', async ({ webActions }, testInfo) => {
    const file = testInfo.outputPath('data.xlsx');
    const workbook = new Workbook();
    workbook.addWorksheet('Users').getCell('A1').value = 'Playwright learner';
    await workbook.xlsx.writeFile(file);
    expect(await webActions.readDataFromExcel(file, 'Users', 1, 1)).toBe('Playwright learner');
    await expect(webActions.readDataFromExcel(file, 'Missing', 1, 1)).rejects.toThrow('does not exist');
});
test('database helper rejects queries before connection and missing configuration', async () => {
    const helper = new DBActions();
    await expect(helper.query('SELECT 1')).rejects.toThrow('Connect to the database');
    await expect(helper.connectDB('')).rejects.toThrow('DATABASE_URL');
    await helper.disconnectDB();
});
test('API fixtures reject traversal paths', async () => {
    await expect(new APIActions().readValuesFromTextFile('../private')).rejects.toThrow('Invalid API fixture');
});
