const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = express();
app.use(bodyParser.json());

async function auditLog({ actor_user_id, tenant_id, action, resource, reason, ip }) {
    await pool.query(
        `INSERT INTO public.audit_logs(actor_user_id,tenant_id,action,resource,reason,ip)
     VALUES ($1,$2,$3,$4,$5,$6)`,
        [actor_user_id, tenant_id, action, resource, reason, ip]
    );
}

async function getUserById(id) {
    const { rows } = await pool.query('SELECT * FROM public.users WHERE id=$1', [id]);
    return rows[0] || null;
}

async function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send('missing auth');
    const token = authHeader.replace(/^Bearer\s+/i, '');
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await getUserById(payload.sub);
        if (!user) return res.status(401).send('user not found');
        req.user = user;
        req.jwt = payload;
        req.tenant = payload.tenant_id || null;
        next();
    } catch (err) {
        return res.status(401).send('invalid token');
    }
}

function machAdmin(req, res, next) {
    if (!req.user.is_mach_admin) return res.status(403).send('not a mach admin');
    next();
}

function tenantScope(req, res, next) {
    if (!req.tenant) return res.status(400).json({ error: 'tenant_id missing' });
    req.tenantSchema = `t_${req.tenant.replace(/-/g, '')}`;
    req.withTenant = async (fn) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(`SET LOCAL search_path = ${req.tenantSchema}, public`);
            const result = await fn(client);
            await client.query('COMMIT');
            return result;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally { client.release(); }
    };
    next();
}

async function createTenantSchema(client, schema) {
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    await client.query(`
    SET LOCAL search_path = ${schema}, public;
    CREATE TABLE IF NOT EXISTS findings(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      category TEXT NOT NULL,
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      details JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `);
}

/* === Mach Admin: Create Tenant === */
app.post('/api/mach/tenants', auth, machAdmin, async (req, res) => {
    const { name, slug, plan } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            `INSERT INTO public.tenants(name,slug,plan)
       VALUES ($1,$2,$3) RETURNING *`,
            [name, slug, plan || 'trial']
        );
        const tenant = rows[0];
        const schema = `t_${tenant.id.replace(/-/g, '')}`;

        await createTenantSchema(client, schema);

        await client.query(
            `INSERT INTO public.tenant_migrations(tenant_id,migration_name)
       VALUES ($1,'initial_schema')`,
            [tenant.id]
        );

        await client.query('COMMIT');

        await auditLog({
            actor_user_id: req.user.id,
            tenant_id: tenant.id,
            action: 'tenant.create',
            resource: slug,
            reason: req.body.reason || null,
            ip: req.ip
        });

        res.status(201).json({ tenant });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'tenant creation failed' });
    } finally {
        client.release();
    }
});

/* === Tenant: Create a finding (Armor core capability) === */
app.post('/api/findings', auth, tenantScope, async (req, res) => {
    const { category, severity, title, details } = req.body;
    try {
        const finding = await req.withTenant(async (client) => {
            const q = `INSERT INTO findings(category,severity,title,details)
                 VALUES ($1,$2,$3,$4) RETURNING *`;
            const r = await client.query(q, [category, severity, title, details]);
            return r.rows[0];
        });
        res.status(201).json({ finding });
    } catch (err) {
        res.status(500).json({ error: 'failed to create finding' });
    }
});

/* === Mach Support Access (short-lived support token) === */
app.post('/api/mach/support/:tenantId', auth, machAdmin, async (req, res) => {
    const tenantId = req.params.tenantId;

    await auditLog({
        actor_user_id: req.user.id,
        tenant_id: tenantId,
        action: 'support.access',
        resource: null,
        reason: req.body.reason || 'support',
        ip: req.ip
    });

    const supportToken = jwt.sign(
        { sub: req.user.id, tenant_id: tenantId, roles: ['mach-support'] },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    res.json({ support_token: supportToken });
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
    console.log(`Armor by Mach backend running on port ${PORT}`)
);
