const { EC2Client, DescribeInstancesCommand } = require('@aws-sdk/client-ec2');

async function collectEc2Instances(credentials, region) {
    if (!credentials) throw new Error('AWS credentials are required to collect EC2 instances');
    if (!region) throw new Error('region is required to collect EC2 instances');

    const client = new EC2Client({ region, credentials });
    let nextToken;
    const instances = [];

    do {
        const command = new DescribeInstancesCommand({ NextToken: nextToken });
        const response = await client.send(command);
        const reservations = response.Reservations || [];
        for (const reservation of reservations) {
            if (reservation.Instances) {
                instances.push(...reservation.Instances);
            }
        }
        nextToken = response.NextToken;
    } while (nextToken);

    return instances;
}

module.exports = {
    collectEc2Instances,
};
