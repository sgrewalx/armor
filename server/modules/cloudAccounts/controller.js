const { runWithTenant } = require('../../db/context');

class CloudAccountsController {

    static async list(req, res) {
        try {
            const context = req.user.schemaName ? { schemaName: req.user.schemaName } : req.tenantId;
            await runWithTenant(context, async (client) => {
                const result = await client.query(
                    `SELECT id, provider, account_id, display_name, status, metadata, created_at
                     FROM cloud_accounts
                     ORDER BY created_at DESC`
                );
                res.json(result.rows);
            });
        } catch (err) {
            console.error('[CloudAccounts] List failed', err);
            res.status(500).json({ message: 'Failed to load cloud accounts' });
        }
    }

    static async create(req, res) {
        try {
            const { provider, accountId, displayName, status, metadata } = req.body;
            if (!provider || !accountId || !displayName) {
                return res.status(400).json({ message: 'provider, accountId, and displayName are required' });
            }

            const context = req.user.schemaName ? { schemaName: req.user.schemaName } : req.tenantId;
            const normalizedStatus = status || 'PENDING';
            const metadataJson = metadata || {};

            await runWithTenant(context, async (client) => {
                const insert = await client.query(
                    `INSERT INTO cloud_accounts (provider, account_id, display_name, status, metadata)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING id, provider, account_id, display_name, status, metadata, created_at`,
                    [provider, accountId, displayName, normalizedStatus, metadataJson]
                );
                res.status(201).json(insert.rows[0]);
            });
        } catch (err) {
            console.error('[CloudAccounts] Create failed', err);
            res.status(500).json({ message: 'Failed to create cloud account' });
        }
    }
}

module.exports = CloudAccountsController;
