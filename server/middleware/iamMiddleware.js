/**
 * Checks if the user has the required permission/feature.
 * @param {string} feature - e.g. "assets.read", "iam.write"
 */
const checkIAM = (feature) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'User context missing' });

        // 1. Root User (Full Access)
        if (user.role === 'root') {
            return next();
        }

        // 2. Provider Support (Read-Only)
        if (user.role === 'provider_support') {
            const isRead = feature.endsWith('.read') || feature.includes('get') || feature.includes('list');
            if (isRead) return next();
            return res.status(403).json({ message: 'Provider Support is Read-Only' });
        }

        // 3. Sub-User (Check Policy)
        if (user.role === 'sub_user') {
            const allowed = user.iam_policy?.allowed_features || [];
            if (allowed.includes('*') || allowed.includes(feature)) {
                return next();
            }
            return res.status(403).json({ message: `Missing permission: ${feature}` });
        }

        return res.status(403).json({ message: 'Unauthorized role' });
    };
};

module.exports = { checkIAM };
