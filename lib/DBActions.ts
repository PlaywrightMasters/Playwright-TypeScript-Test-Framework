import { Client } from 'pg';
import type { QueryResult, QueryResultRow } from 'pg';

export class DBActions {
    private client: Client | undefined;

    async connectDB(connectionString: string): Promise<void> {
        if (!connectionString) throw new Error('DATABASE_URL is required for database tests.');
        if (this.client) throw new Error('Database client is already connected.');
        const client = new Client({ connectionString, connectionTimeoutMillis: 10_000, query_timeout: 10_000 });
        try {
            await client.connect();
            this.client = client;
        } catch (error) {
            await client.end().catch(() => undefined);
            throw error;
        }
    }

    async query<T extends QueryResultRow = QueryResultRow>(sql: string, values: unknown[] = []): Promise<QueryResult<T>> {
        if (!this.client) throw new Error('Connect to the database before running a query.');
        return this.client.query<T>(sql, values);
    }

    async disconnectDB(): Promise<void> {
        const client = this.client;
        this.client = undefined;
        if (client) await client.end();
    }
}
