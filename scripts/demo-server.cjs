const http = require('node:http');
const { randomUUID } = require('node:crypto');
const { readFileSync, existsSync } = require('node:fs');
if (existsSync('.env')) process.loadEnvFile('.env');
const path = require('node:path');

function createDemoServer() {
    return http.createServer(async (request, response) => {
        const send = (status, body) => {
            response.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
            response.end(JSON.stringify(body));
        };
        const pathname = new URL(request.url, 'http://localhost').pathname;
        if (pathname === '/health') return send(200, { status: 'ok' });
        if (pathname === '/api/users' && request.method === 'GET') {
            return send(200, {
                page: 1, per_page: 1, total: 1, total_pages: 1,
                data: [{ id: 1, email: 'learner@example.test', first_name: 'Playwright', last_name: 'Learner', avatar: '/avatar.svg' }],
                support: { url: 'https://playwright.dev', text: 'Learn browser automation' }
            });
        }
        if (pathname === '/api/users' && request.method === 'POST') {
            if (!request.headers['content-type']?.startsWith('application/json')) return send(415, { error: 'Expected application/json' });
            try {
                let size = 0;
                const chunks = [];
                for await (const chunk of request) {
                    size += chunk.length;
                    if (size <= 16_384) chunks.push(chunk);
                }
                if (size > 16_384) return send(413, { error: 'Request too large' });
                let body;
                try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
                catch { return send(400, { error: 'Invalid JSON' }); }
                if (!body || typeof body.name !== 'string' || !body.name.trim() || typeof body.job !== 'string' || !body.job.trim()) {
                    return send(400, { error: 'name and job are required strings' });
                }
                return send(201, { name: body.name, job: body.job, id: randomUUID(), createdAt: new Date().toISOString() });
            } catch {
                if (!response.headersSent) return send(500, { error: 'Unable to read request' });
                return response.end();
            }
        }
        if (pathname === '/download' && request.method === 'GET') {
            response.writeHead(200, { 'content-type': 'text/plain', 'content-disposition': 'attachment; filename="sample.txt"' });
            return response.end('Playwright Masters download example\n');
        }
        if (pathname === '/' && request.method === 'GET') {
            response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'x-content-type-options': 'nosniff' });
            return response.end(readFileSync(path.join(__dirname, 'demo.html')));
        }
        return send(404, { error: 'Not found' });
    });
}
module.exports = { createDemoServer };
if (require.main === module) {
    const port = Number(process.env.DEMO_PORT ?? 4173);
    if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid DEMO_PORT');
    const server = createDemoServer();
    server.listen(port, '127.0.0.1', () => console.log('Local test target ready on port ' + port));
    for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
}
