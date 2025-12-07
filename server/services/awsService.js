const { STSClient, AssumeRoleCommand } = require('@aws-sdk/client-sts');
const { EC2Client, DescribeInstancesCommand, DescribeSecurityGroupsCommand } = require('@aws-sdk/client-ec2');
const { S3Client, ListBucketsCommand, GetBucketEncryptionCommand, GetPublicAccessBlockCommand } = require('@aws-sdk/client-s3');

// assumeRole returns temporary credentials
const assumeRole = async (roleArn, externalId, region) => {
    const sts = new STSClient({ region });
    const command = new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: 'ArmorSession',
        ExternalId: externalId
    });
    const response = await sts.send(command);
    return {
        accessKeyId: response.Credentials.AccessKeyId,
        secretAccessKey: response.Credentials.SecretAccessKey,
        sessionToken: response.Credentials.SessionToken
    };
};

const getEC2Client = async (account, region) => {
    const creds = await assumeRole(account.roleArn, account.externalId, region);
    return new EC2Client({
        region,
        credentials: creds
    });
};

const getS3Client = async (account, region) => {
    const creds = await assumeRole(account.roleArn, account.externalId, region);
    return new S3Client({
        region,
        credentials: creds
    });
};

const fetchEC2Instances = async (account, region) => {
    try {
        const client = await getEC2Client(account, region);
        const command = new DescribeInstancesCommand({});
        const response = await client.send(command);

        const instances = [];
        response.Reservations.forEach(reservation => {
            reservation.Instances.forEach(instance => {
                instances.push({
                    name: instance.Tags?.find(t => t.Key === 'Name')?.Value || instance.InstanceId,
                    id: instance.InstanceId,
                    type: 'AWS_EC2',
                    region: region,
                    details: instance
                });
            });
        });
        return instances;
    } catch (error) {
        console.error('Error fetching EC2:', error);
        return [];
    }
};

const fetchS3Buckets = async (account, region) => {
    try {
        const client = await getS3Client(account, region);
        const command = new ListBucketsCommand({});
        const response = await client.send(command);

        return response.Buckets.map(bucket => ({
            name: bucket.Name,
            id: bucket.Name,
            type: 'AWS_S3',
            region: region,
            details: {}
        }));
    } catch (error) {
        console.error('Error fetching S3:', error);
        return [];
    }
};

const checkSecurityGroup = async (account, region, groupId) => {
    try {
        const client = await getEC2Client(account, region);
        const command = new DescribeSecurityGroupsCommand({ GroupIds: [groupId] });
        const response = await client.send(command);
        const sg = response.SecurityGroups[0];

        const issues = [];
        sg.IpPermissions?.forEach(perm => {
            if (perm.IpRanges?.some(range => range.CidrIp === '0.0.0.0/0')) {
                if (perm.FromPort <= 22 && perm.ToPort >= 22) {
                    issues.push('Port 22 (SSH) open to world');
                }
                if (perm.FromPort <= 3389 && perm.ToPort >= 3389) {
                    issues.push('Port 3389 (RDP) open to world');
                }
            }
        });
        return issues;
    } catch (e) {
        return [];
    }
};

const checkS3PublicAccess = async (account, region, bucketName) => {
    try {
        const client = await getS3Client(account, region);
        const command = new GetPublicAccessBlockCommand({ Bucket: bucketName });
        const response = await client.send(command);
        const config = response.PublicAccessBlockConfiguration;

        if (!config.BlockPublicAcls || !config.BlockPublicPolicy || !config.IgnorePublicAcls || !config.RestrictPublicBuckets) {
            return ['Bucket Public Access Block not fully enabled'];
        }
        return [];
    } catch (e) {
        return ['Bucket Public Access configuration not found (Potentially Public)'];
    }
};

module.exports = { fetchEC2Instances, fetchS3Buckets, checkSecurityGroup, checkS3PublicAccess };
