const prisma = require('../src/config/prisma');

async function main() {
  try {
    const userCount = await prisma.user.count();
    const tenantCount = await prisma.tenant.count();
    const leadCount = await prisma.lead.count();
    const dealCount = await prisma.deal.count();
    const users = await prisma.user.findMany({
      take: 3,
      select: { id: true, name: true, email: true, role: true }
    });

    console.log('✅ DATABASE CONNECTED SUCCESSFULLY!');
    console.log('Tenants:', tenantCount);
    console.log('Users:', userCount);
    console.log('Leads:', leadCount);
    console.log('Deals:', dealCount);
    console.log('Sample Users in DB:', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('❌ Database Connection Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
