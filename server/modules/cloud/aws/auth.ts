const { STSClient, AssumeRoleCommand } = require('@aws-sdk/client-sts');

async function assumeAwsRole(roleArn, externalId, region = 'us-east-1') {
    if (!roleArn) throw new Error('roleArn is required for AssumeRole');
    if (!externalId) throw new Error('externalId is required for AssumeRole');

    const sts = new STSClient({ region });
    const command = new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: 'armor-ec2-scan',
        ExternalId: externalId,
        DurationSeconds: 3600,
    });

    const response = await sts.send(command);
    if (!response.Credentials) {
        throw new Error('Failed to assume role: missing credentials in response');
    }

    const { AccessKeyId, SecretAccessKey, SessionToken, Expiration } = response.Credentials;

    return {
        accessKeyId: AccessKeyId,
        secretAccessKey: SecretAccessKey,
        sessionToken: SessionToken,
        expiration: Expiration,
    };
}

module.exports = {
    assumeAwsRole,
};
