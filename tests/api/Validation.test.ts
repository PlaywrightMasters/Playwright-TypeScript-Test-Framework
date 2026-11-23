import { test, expect } from '@playwright/test';
import { environment } from '../../testConfig';

test.describe('local API validation', () => {
    test.skip(environment !== 'local', 'These cases describe the bundled local server.');
    test('rejects malformed JSON', async ({ request }) => {
        const response = await request.post('/api/users', { data: Buffer.from('{'), headers: { 'content-type': 'application/json' } });
        expect(response.status()).toBe(400);
        expect(await response.json()).toEqual({ error: 'Invalid JSON' });
    });
    test('rejects missing required fields', async ({ request }) => {
        const response = await request.post('/api/users', { data: { name: 'Learner' } });
        expect(response.status()).toBe(400);
    });
    test('rejects unsupported media types', async ({ request }) => {
        const response = await request.post('/api/users', { data: 'hello', headers: { 'content-type': 'text/plain' } });
        expect(response.status()).toBe(415);
    });
    test('limits request size', async ({ request }) => {
        const response = await request.post('/api/users', { data: { name: 'x'.repeat(17_000), job: 'Tester' } });
        expect(response.status()).toBe(413);
    });
    test('returns 404 for unknown paths', async ({ request }) => {
        const response = await request.get('/does-not-exist');
        expect(response.status()).toBe(404);
    });
});
