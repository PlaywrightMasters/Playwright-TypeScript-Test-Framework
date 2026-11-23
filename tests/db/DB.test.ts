import { test, expect } from '@playwright/test';
import { DBActions } from '@lib/DBActions';
import { testConfig } from '../../testConfig';

test('connects to PostgreSQL and safely binds query parameters', async () => {
    const database = new DBActions();
    try {
        await database.connectDB(testConfig.databaseURL);
        const result = await database.query<{ value: string }>('SELECT $1::text AS value', ["O'Reilly"]);
        expect(result.rows).toEqual([{ value: "O'Reilly" }]);
    } finally {
        await database.disconnectDB();
    }
});
