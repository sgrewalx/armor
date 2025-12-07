const { PrismaClient } = require('@prisma/client');
const { fetchEC2Instances, fetchS3Buckets } = require('../services/awsService');
const prisma = new PrismaClient();

const getAssets = async (req, res) => {
    try {
        const assets = await prisma.cloudAsset.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(assets);
    } catch (error) {
        console.error('Get Assets error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const syncAssets = async (req, res) => {
    try {
        // Get all connected accounts
        const accounts = await prisma.cloudAccount.findMany();
        let totalSynced = 0;

        for (const account of accounts) {
            // 1. Fetch EC2
            const ec2Instances = await fetchEC2Instances(account, account.region);
            for (const instance of ec2Instances) {
                // Upsert (Create or Update)
                // Note: ideally we should have a unique ID constraint, for now assume name is unique or just create
                const textDetails = JSON.stringify(instance.details);
                const existing = await prisma.cloudAsset.findFirst({ where: { name: instance.name } });

                if (!existing) {
                    await prisma.cloudAsset.create({
                        data: {
                            name: instance.name,
                            type: 'AWS_EC2',
                            region: instance.region,
                            tags: textDetails // Storing full details in tags/json field for scanning
                        }
                    });
                    totalSynced++;
                }
            }

            // 2. Fetch S3
            const s3Buckets = await fetchS3Buckets(account, account.region);
            for (const bucket of s3Buckets) {
                const existing = await prisma.cloudAsset.findFirst({ where: { name: bucket.name } });
                if (!existing) {
                    await prisma.cloudAsset.create({
                        data: {
                            name: bucket.name,
                            type: 'AWS_S3',
                            region: bucket.region,
                            tags: {}
                        }
                    });
                    totalSynced++;
                }
            }
        }
        res.json({ message: `Synced ${totalSynced} new assets from AWS.` });
    } catch (error) {
        console.error('Sync Assets error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const addAsset = async (req, res) => {
    try {
        const { name, type, region, tags } = req.body;

        if (!name || !type || !region) {
            return res.status(400).json({ message: 'Name, Type and Region are required' });
        }

        const asset = await prisma.cloudAsset.create({
            data: {
                name,
                type,
                region,
                tags: tags || {}
            }
        });

        res.status(201).json(asset);
    } catch (error) {
        console.error('Add Asset error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteAsset = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.cloudAsset.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Asset deleted' });
    } catch (error) {
        console.error('Delete Asset error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { getAssets, addAsset, deleteAsset, syncAssets };
