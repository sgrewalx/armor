function extractNameFromTags(tags = []) {
    const nameTag = tags.find((tag) => tag.Key === 'Name');
    return nameTag ? nameTag.Value : undefined;
}

function normalizeEc2Instances(instances, region) {
    return (instances || []).map((instance) => {
        const securityGroups = (instance.SecurityGroups || []).map((sg) => sg.GroupId).filter(Boolean);
        return {
            asset_type: 'ec2_instance',
            cloud_provider: 'aws',
            region,
            resource_id: instance.InstanceId,
            name: extractNameFromTags(instance.Tags) || instance.InstanceId,
            public_ip: instance.PublicIpAddress || null,
            private_ip: instance.PrivateIpAddress || null,
            vpc_id: instance.VpcId || null,
            subnet_id: instance.SubnetId || null,
            security_groups: securityGroups,
            state: instance.State ? instance.State.Name : null,
            metadata: instance,
        };
    });
}

module.exports = {
    normalizeEc2Instances,
};
