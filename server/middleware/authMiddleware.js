const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { runWithTenant } = require('../db/context');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 0. Check Revocation (using JTI in public.revoked_tokens)
        if (decoded.jti) {
            const revoked = await prisma.revokedToken.findUnique({
                where: { jti: decoded.jti }
            });
            if (revoked) {
                return res.status(401).json({ message: 'Token has been revoked' });
            }
        }

        // 1. Provider Admin
        if (decoded.role === 'provider_admin') {
            // Verify against public.provider_admins
            const admin = await prisma.providerAdmin.findUnique({
                where: { id: decoded.userId }
            });
            if (!admin) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            req.user = { ...admin, role: 'provider_admin', type: 'provider' };
            req.tenantId = null;
            return next();
        }

        // 2. Tenant Context
        if (decoded.tenantId) {
            const tenantId = decoded.tenantId;
            req.tenantId = tenantId;

            // 2a. Provider Support Access (Read-Only)
            if (decoded.role === 'provider_support') {
                req.user = {
                    id: decoded.userId,
                    role: 'provider_support',
                    type: 'support',
                    tenantId
                };
                return next();
            }

            // 2b. Tenant User (Root or Sub-User)
            // Fetch User from Tenant Schema
            await runWithTenant(tenantId, async (tx) => {
                const user = await tx.user.findUnique({
                    where: { id: decoded.userId }
                });

                if (!user) {
                    throw new Error('User not found in tenant');
                }

                req.user = {
                    ...user,
                    tenantId,
                    type: 'tenant'
                };
            });
            return next();
        }

        return res.status(401).json({ message: 'Invalid token structure' });

    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
