const { PrismaClient } = require('@prisma/client');
const { checkSecurityGroup, checkS3PublicAccess } = require('../services/awsService');
const prisma = new PrismaClient();

const startScan = async (req, res) => {
    try {
        const scan = await prisma.scan.create({
            data: {
                status: 'RUNNING'
            }
        });

        // Run async scan
        (async () => {
            try {
                const assets = await prisma.cloudAsset.findMany();
                const accounts = await prisma.cloudAccount.findMany(); // Assuming 1 account for MVP simplicity or find by region

                for (const asset of assets) {
                    // Find credential for this asset's region (simplification)
                    const account = accounts.find(a => a.region === asset.region) || accounts[0];
                    if (!account) continue;

                    // REMOVED: const credentials = ... (we now pass account object to service)

                    let findings = [];

                    if (asset.type === 'AWS_EC2') {
                        // Identify Security Group ID from details or tags
                        // For MVP, we'll try to fetch details from tags if we stored them
                        try {
                            const details = JSON.parse(asset.tags);
                            if (details.SecurityGroups) {
                                for (const sg of details.SecurityGroups) {
                                    const issues = await checkSecurityGroup(account, asset.region, sg.GroupId);
                                    findings.push(...issues);
                                }
                            }
                        } catch (e) { }
                    } else if (asset.type === 'AWS_S3') {
                        const issues = await checkS3PublicAccess(account, asset.region, asset.name);
                        findings.push(...issues);
                    }

                    // Store findings
                    for (const finding of findings) {
                        await prisma.scanResult.create({
                            data: {
                                scanId: scan.id,
                                assetId: asset.id,
                                severity: 'HIGH',
                                description: finding
                            }
                        });
                    }
                }

                await prisma.scan.update({
                    where: { id: scan.id },
                    data: {
                        status: 'COMPLETED',
                        finishedAt: new Date()
                    }
                });
            } catch (err) {
                console.error('Scan job failed', err);
                await prisma.scan.update({ where: { id: scan.id }, data: { status: 'FAILED' } });
            }
        })();

        res.status(201).json(scan);
    } catch (error) {
        console.error('Start Scan error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getScans = async (req, res) => {
    try {
        const scans = await prisma.scan.findMany({
            orderBy: { startedAt: 'desc' },
            include: { _count: { select: { results: true } } }
        });
        res.json(scans);
    } catch (error) {
        console.error('Get Scans error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getScanResults = async (req, res) => {
    try {
        const { id } = req.params;
        const results = await prisma.scanResult.findMany({
            where: { scanId: parseInt(id) },
            include: { asset: true }
        });
        res.json(results);
    } catch (error) {
        console.error('Get Scan Results error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { startScan, getScans, getScanResults };
