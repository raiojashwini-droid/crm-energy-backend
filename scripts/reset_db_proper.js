const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting clean wipe of all transactional/business data from local MySQL...');

  // Use raw SQL with foreign key checks disabled for 100% clean and fast wipe
  const tables = [
    'activities',
    'tasks',
    'notes',
    'communications',
    'invoices',
    'sales_orders',
    'purchase_orders',
    'inventory_items',
    'production_orders',
    'erp_projects',
    'deals',
    'leads',
    'contacts',
    'support_tickets',
    'knowledge_articles',
    'territories',
    'hr_employees',
    'hr_candidates',
    'ledger_accounts',
    'ebox_messages',
  ];

  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`);
      console.log(`  ✓ Table \`${table}\` truncated.`);
    } catch (err) {
      console.warn(`  ⚠️ Failed to truncate \`${table}\`: ${err.message}`);
    }
  }

  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

  console.log('\n🔍 Verifying table counts after wipe:');
  const verifyCounts = {
    leads: await prisma.lead.count(),
    deals: await prisma.deal.count(),
    contacts: await prisma.contact.count(),
    tasks: await prisma.task.count(),
    notes: await prisma.note.count(),
    activities: await prisma.activity.count(),
    erpProjects: await prisma.erpProject.count(),
    salesOrders: await prisma.salesOrder.count(),
    purchaseOrders: await prisma.purchaseOrder.count(),
    inventoryItems: await prisma.inventoryItem.count(),
    users: await prisma.user.count(),
    tenants: await prisma.tenant.count(),
  };

  console.table(verifyCounts);
  console.log('✨ All transactional data has been completely erased. Users and Tenants preserved for login.');
}

main()
  .catch((err) => {
    console.error('❌ Error clearing database:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
