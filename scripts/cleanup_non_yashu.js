const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupNonYashuData() {
  console.log('=== CLEANING UP ALL NON-YASHU TEST DATA ===\n');

  try {
    // 1. Delete non-Yashu Activities
    const delActivities = await prisma.activity.deleteMany({
      where: {
        NOT: [
          { title: { contains: 'Yashu' } },
          { description: { contains: 'Yashu' } }
        ]
      }
    });
    console.log(`[CLEANED] Deleted ${delActivities.count} non-Yashu activities.`);

    // 2. Delete non-Yashu Sales Orders
    const delSalesOrders = await prisma.salesOrder.deleteMany({
      where: {
        NOT: { customer: { contains: 'Yashu' } }
      }
    });
    console.log(`[CLEANED] Deleted ${delSalesOrders.count} non-Yashu sales orders.`);

    // 3. Delete non-Yashu ERP Projects
    const delProjects = await prisma.erpProject.deleteMany({
      where: {
        NOT: [
          { name: { contains: 'Yashu' } },
          { client: { contains: 'Yashu' } }
        ]
      }
    });
    console.log(`[CLEANED] Deleted ${delProjects.count} non-Yashu ERP projects.`);

    // 4. Delete non-Yashu Notes
    const delNotes = await prisma.note.deleteMany({
      where: {
        NOT: { content: { contains: 'Yashu' } }
      }
    });
    console.log(`[CLEANED] Deleted ${delNotes.count} non-Yashu notes.`);

    // 5. Delete non-Yashu Tasks
    const delTasks = await prisma.task.deleteMany({
      where: {
        NOT: { title: { contains: 'Yashu' } }
      }
    });
    console.log(`[CLEANED] Deleted ${delTasks.count} non-Yashu tasks.`);

    // 6. Delete non-Yashu Deals
    const delDeals = await prisma.deal.deleteMany({
      where: {
        NOT: { title: { contains: 'Yashu' } }
      }
    });
    console.log(`[CLEANED] Deleted ${delDeals.count} non-Yashu deals.`);

    // 7. Delete non-Yashu Contacts
    const delContacts = await prisma.contact.deleteMany({
      where: {
        NOT: [
          { name: { contains: 'Yashu' } },
          { company: { contains: 'Yashu' } }
        ]
      }
    });
    console.log(`[CLEANED] Deleted ${delContacts.count} non-Yashu contacts.`);

    // 8. Delete non-Yashu Leads
    const delLeads = await prisma.lead.deleteMany({
      where: {
        NOT: [
          { name: { contains: 'Yashu' } },
          { company: { contains: 'Yashu' } }
        ]
      }
    });
    console.log(`[CLEANED] Deleted ${delLeads.count} non-Yashu leads.`);

    // 9. Delete test Purchase Orders
    const delPOs = await prisma.purchaseOrder.deleteMany({});
    console.log(`[CLEANED] Deleted ${delPOs.count} test purchase orders.`);

    // 10. Delete test Inventory Items
    const delInv = await prisma.inventoryItem.deleteMany({});
    console.log(`[CLEANED] Deleted ${delInv.count} test inventory items.`);

    // Summary of remaining data
    console.log('\n================ REMAINING CLEAN DATABASE SUMMARY ================');
    console.log('Tenants:', await prisma.tenant.count());
    console.log('Users:', await prisma.user.count());
    console.log('Leads:', await prisma.lead.count(), '->', await prisma.lead.findMany({ select: { name: true, status: true } }));
    console.log('Contacts:', await prisma.contact.count(), '->', await prisma.contact.findMany({ select: { name: true, company: true } }));
    console.log('Deals:', await prisma.deal.count(), '->', await prisma.deal.findMany({ select: { title: true, stage: true, value: true } }));
    console.log('Tasks:', await prisma.task.count(), '->', await prisma.task.findMany({ select: { title: true, status: true } }));
    console.log('Notes:', await prisma.note.count(), '->', await prisma.note.findMany({ select: { content: true } }));
    console.log('ERP Projects:', await prisma.erpProject.count(), '->', await prisma.erpProject.findMany({ select: { name: true, budget: true } }));
    console.log('Sales Orders:', await prisma.salesOrder.count(), '->', await prisma.salesOrder.findMany({ select: { orderNumber: true, total: true } }));
    console.log('Activities:', await prisma.activity.count());
    console.log('==================================================================\n');

  } catch (err) {
    console.error('CLEANUP ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupNonYashuData();
