const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@armor.com';
    const password = 'admin'; // Change in production!

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Using explicit table create if model mapping is tricky, but strict schema usage should work.
    // ProviderAdmin is mapped to "provider_admins" in "public".

    // Note: Ensure `npx prisma migrate dev` has been run first!

    const admin = await prisma.providerAdmin.upsert({
        where: { email },
        update: {},
        create: {
            email,
            passwordHash,
            isSuperAdmin: true
        }
    });

    console.log(`Provider Admin seeded: ${admin.email}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
