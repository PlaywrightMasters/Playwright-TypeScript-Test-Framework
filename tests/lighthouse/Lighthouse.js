const fs = require('node:fs/promises');
const { chromium } = require('@playwright/test');
const { createDemoServer } = require('../../scripts/demo-server.cjs');

(async () => {
    const { default: lighthouse } = await import('lighthouse');
    const { launch } = await import('chrome-launcher');
    const url = process.env.LIGHTHOUSE_URL || 'http://127.0.0.1:4173';
    let server;
    let chrome;
    try {
        if (!process.env.LIGHTHOUSE_URL) {
            server = createDemoServer();
            await new Promise((resolve, reject) => { server.once('error', reject); server.listen(4173, '127.0.0.1', resolve); });
        }
        chrome = await launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless'] });
        const result = await lighthouse(url, { port: chrome.port, output: ['html', 'json'], onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
        if (!result || result.lhr.runtimeError) throw new Error(result?.lhr.runtimeError?.message || 'No Lighthouse result');
        await fs.mkdir('reports', { recursive: true });
        await fs.writeFile('reports/lighthouse.html', result.report[0]);
        await fs.writeFile('reports/lighthouse.json', result.report[1]);
        console.log('Lighthouse reports saved in reports/.');
    } finally {
        if (chrome) await chrome.kill();
        if (server?.listening) await new Promise(resolve => server.close(resolve));
    }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
