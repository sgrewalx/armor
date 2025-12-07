/**
 * IAM Permission Check Middleware
 * @param {string} requiredAction - e.g. "findings.read", "integrations.write"
 */
const checkIAM = (requiredAction) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'User context required' });
        }

        // 1. Root User: Full Access
        if (user.role === 'root') {
            return next();
        }

        // 2. Provider Support: Read-Only Access
        if (user.role === 'provider_support') {
            // Check if action matches "safe" pattern
            if (requiredAction.endsWith('.read') || requiredAction.includes('list') || requiredAction.includes('view') || requiredAction.includes('get')) {
                return next();
            }
            return res.status(403).json({ message: 'Provider Support is Read-Only' });
        }

        // 3. Sub-User: Check IAM Policy
        if (user.role === 'sub_user') {
            const policy = user.iamPolicy || {};
            const allowed = policy.allowed_features || [];

            if (allowed.includes(requiredAction)) {
                return next();
            }

            return res.status(403).json({ message: `Access Denied: Missing permission '${requiredAction}'` });
        }

        return res.status(403).json({ message: 'Unauthorized role' });
    };
};

module.exports = { checkIAM };
