const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
    try {
        console.log("Running Armor backend smoke tests...");

        await pool.query("SELECT 1 FROM public.tenants LIMIT 1");

        console.log("Public tables OK");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
