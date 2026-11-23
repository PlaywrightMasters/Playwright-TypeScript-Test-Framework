import { mkdir, rm } from 'node:fs/promises';

export default async function globalSetup(): Promise<void> {
    // Each CI shard has its own checkout and output directory.
    await rm('allure-results', { recursive: true, force: true });
    await mkdir('logs', { recursive: true });
}
