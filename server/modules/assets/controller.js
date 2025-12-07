const { runWithTenant } = require('../../db/context');

class AssetsController {

    static async list(req, res) {
        try {
            const context = req.user.schemaName ? { schemaName: req.user.schemaName } : req.tenantId;

            await runWithTenant(context, async (client) => {
                const result = await client.query(`SELECT * FROM assets ORDER BY created_at DESC`);
                res.json(result.rows);
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to list assets' });
        }
    }

    static async create(req, res) {
        try {
            const { name, type, region, native_id } = req.body;
            // validation skipped for brevity

            const context = req.user.schemaName ? { schemaName: req.user.schemaName } : req.tenantId;

            await runWithTenant(context, async (client) => {
                const result = await client.query(
                    `INSERT INTO assets (name, type, region, native_id) VALUES ($1, $2, $3, $4) RETURNING *`,
                    [name, type, region, native_id]
                );
                res.status(201).json(result.rows[0]);
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to create asset' });
        }
    }
}

module.exports = AssetsController;
