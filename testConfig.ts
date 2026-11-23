import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

if (existsSync('.env')) loadEnvFile('.env');
export const environment = process.env.ENV ?? 'local';
if (!['local', 'qa', 'dev', 'qaApi', 'devApi'].includes(environment)) {
    throw new Error('ENV must be local, qa, dev, qaApi, or devApi.');
}
const port = Number(process.env.DEMO_PORT ?? 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error('DEMO_PORT must be an integer from 1024 to 65535.');
}
const localURL = `http://127.0.0.1:${port}`;
const isDev = environment.startsWith('dev');
const baseURL = process.env.BASE_URL ?? (environment === 'local' ? localURL : isDev ? '' : 'https://demoqa.com');
const apiURL = process.env.API_BASE_URL ?? (environment === 'local' ? localURL : isDev ? '' : 'https://reqres.in');
for (const [name, value] of [['BASE_URL', baseURL], ['API_BASE_URL', apiURL]]) {
    if (!value) throw new Error(`${name} is required for a dev environment.`);
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
        throw new Error(`${name} must be an HTTP(S) URL without embedded credentials.`);
    }
}
if (environment === 'local' && [baseURL, apiURL].some(url => url.replace(/\/$/, '') !== localURL)) {
    throw new Error('Local URLs must match DEMO_PORT. Use ENV=qa or dev for an external target.');
}
export const testConfig = {
    environment, port, localURL, baseURL, apiURL,
    username: process.env.TEST_USERNAME ?? '',
    password: process.env.TEST_PASSWORD ?? '',
    databaseURL: process.env.DATABASE_URL ?? '',
    waitForElement: 10_000
};
