const fs = require('fs');
const path = require('path');
const { pool } = require('../db');

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

async function run() {
    console.log('Running migrations...');
    const client = await pool.connect();

    try {
        // Only run public migrations (000_*.sql) globally
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.sql') && f.startsWith('000_'))
            .sort();

        for (const file of files) {
            console.log(`Applying ${file}...`);
            const filePath = path.join(MIGRATIONS_DIR, file);
            const sql = fs.readFileSync(filePath, 'utf-8');

            await client.query('BEGIN');
            await client.query(sql);
            await client.query('COMMIT');
            console.log(`Applied ${file}`);
        }

        console.log('Public migrations completed.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
