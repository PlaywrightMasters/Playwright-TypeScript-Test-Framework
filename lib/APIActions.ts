import { readFile } from 'node:fs/promises';
import type { APIResponse } from '@playwright/test';
import { expect } from '@playwright/test';
import { environment } from '../testConfig';

export class APIActions {
    getReqResHeaders(): Record<string, string> {
        if (environment === 'local') return {};
        const apiKey = process.env.REQRES_API_KEY;
        if (!apiKey) throw new Error('REQRES_API_KEY is required for the external ReqRes examples.');
        return { 'x-api-key': apiKey };
    }

    async verifyStatusCode(response: APIResponse, expectedStatus?: number): Promise<void> {
        if (expectedStatus !== undefined) expect(response.status()).toBe(expectedStatus);
        else await expect(response).toBeOK();
    }

    async verifyResponseBody(expected: string, body: unknown, responseType: string): Promise<void> {
        const keys = new Set<string>();
        function collect(value: unknown): void {
            if (Array.isArray(value)) { value.forEach(collect); return; }
            if (value && typeof value === 'object') {
                for (const [key, child] of Object.entries(value)) { keys.add(key); collect(child); }
            }
        }
        collect(body);
        const missing = expected.split('|').map(key => key.trim()).filter(key => key && !keys.has(key));
        expect(missing, `Missing properties in ${responseType}`).toEqual([]);
    }

    async verifyResponseHeader(expected: string, headers: Array<{ name: string; value: string }>, responseType: string): Promise<void> {
        const actual = new Set(headers.map(header => header.name.toLowerCase()));
        const missing = expected.split(',').map(header => header.trim().toLowerCase()).filter(header => header && !actual.has(header));
        expect(missing, `Missing headers in ${responseType}`).toEqual([]);
    }

    async readValuesFromTextFile(fileName: string): Promise<string> {
        if (!/^[a-zA-Z0-9_-]+$/.test(fileName)) throw new Error('Invalid API fixture name.');
        return readFile(`utils/api/${fileName}.txt`, 'utf8');
    }
}
