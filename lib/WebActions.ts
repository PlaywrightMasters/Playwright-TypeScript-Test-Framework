import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { BrowserContext, Page } from '@playwright/test';
import { testConfig } from '../testConfig';

export class WebActions {
    constructor(readonly page: Page, readonly context: BrowserContext) {}

    async decipherPassword(): Promise<string> {
        // Kept for compatibility with the imported page objects.
        if (!testConfig.password) throw new Error('TEST_PASSWORD is required for login examples.');
        return testConfig.password;
    }
    async delay(time: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, time));
    }
    async clickByText(text: string): Promise<void> {
        await this.page.getByText(text, { exact: true }).click();
    }
    async clickElementJS(selector: string): Promise<void> {
        await this.page.locator(selector).evaluate((element: HTMLElement) => element.click());
    }
    async readDataFromExcel(fileName: string, sheetName: string, rowNum: number, cellNum: number): Promise<string> {
        const { default: ExcelJS } = await import('exceljs');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(path.resolve('Downloads', fileName));
        const sheet = workbook.getWorksheet(sheetName);
        if (!sheet) throw new Error(`Worksheet "${sheetName}" does not exist.`);
        return sheet.getRow(rowNum).getCell(cellNum).text;
    }
    async readValuesFromTextFile(filePath: string): Promise<string> {
        return readFile(filePath, 'utf8');
    }
    async writeDataIntoTextFile(filePath: string, data: string | Uint8Array): Promise<void> {
        await writeFile(filePath, data);
    }
    async getPDFText(filePath: string): Promise<string> {
        const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const bytes = new Uint8Array(await readFile(filePath));
        const loadingTask = getDocument({ data: bytes, useSystemFonts: true });
        const document = await loadingTask.promise;
        try {
            const pages: string[] = [];
            for (let number = 1; number <= document.numPages; number++) {
                const page = await document.getPage(number);
                const text = await page.getTextContent();
                pages.push(text.items.map(item => 'str' in item ? item.str : '').join(' '));
            }
            return pages.join(' ');
        } finally {
            await loadingTask.destroy();
        }
    }
}
