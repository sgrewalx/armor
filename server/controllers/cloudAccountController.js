const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addCloudAccount = async (req, res) => {
    try {
        const { provider, accountId, roleArn, externalId, region } = req.body;

        if (!provider || !accountId || !roleArn || !region) {
            return res.status(400).json({ message: 'Role ARN, Account ID and Region are required' });
        }

        const account = await prisma.cloudAccount.create({
            data: {
                provider,
                accountId,
                roleArn,
                externalId,
                region
            }
        });

        res.status(201).json({ message: 'Cloud Account connected', id: account.id });
    } catch (error) {
        console.error('Add Cloud Account error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getCloudAccounts = async (req, res) => {
    try {
        const accounts = await prisma.cloudAccount.findMany();
        res.json(accounts);
    } catch (error) {
        console.error('Get Cloud Accounts error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { addCloudAccount, getCloudAccounts };
