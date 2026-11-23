const { spawnSync } = require('node:child_process');
const { existsSync, mkdirSync } = require('node:fs');
if (!existsSync('playwright-report/index.html')) throw new Error('Run tests to generate playwright-report first.');
mkdirSync('reports', { recursive: true });
const command = process.platform === 'win32' ? 'powershell.exe' : 'zip';
const args = process.platform === 'win32'
    ? ['-NoProfile', '-NonInteractive', '-Command', "Compress-Archive -LiteralPath 'playwright-report' -DestinationPath 'reports/playwright-report.zip' -Force"]
    : ['-r', 'reports/playwright-report.zip', 'playwright-report'];
const result = spawnSync(command, args, { stdio: 'inherit', shell: false });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
