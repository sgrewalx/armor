const { runWithTenant } = require('../../db/context');

class FindingsController {

    static async list(req, res) {
        try {
            const context = req.user.schemaName ? { schemaName: req.user.schemaName } : req.tenantId;

            await runWithTenant(context, async (client) => {
                const result = await client.query(`SELECT * FROM findings ORDER BY created_at DESC`);
                res.json(result.rows);
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to list findings' });
        }
    }
}

module.exports = FindingsController;
