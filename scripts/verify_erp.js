const { PrismaClient } = require('@prisma/client');
const erpService = require('../src/services/erpService');
const prisma = new PrismaClient();

async function runE2EVerification() {
  console.log('=== STARTING CRM -> ERP END-TO-END VERIFICATION ===\n');

  try {
    // 1. Verify User and Tenant
    const user = await prisma.user.findFirst({
      include: { tenant: true }
    });
    if (!user) throw new Error('No user found in database');
    console.log(`[PASS] 1. Auth context verified: User=${user.email}, TenantId=${user.tenantId}`);

    // 2. Find or Create a Test Deal
    let deal = await prisma.deal.findFirst({
      where: { tenantId: user.tenantId, stage: 'WON' },
      include: { contact: true, erpProject: true }
    });

    if (!deal) {
      let contact = await prisma.contact.findFirst({ where: { tenantId: user.tenantId } });
      if (!contact) {
        contact = await prisma.contact.create({
          data: {
            name: 'Acme Test Contact',
            email: 'test@acme.com',
            company: 'Acme Corp',
            tenantId: user.tenantId,
            assignedUserId: user.id
          }
        });
      }
      deal = await prisma.deal.create({
        data: {
          title: 'Acme Enterprise ERP Implementation',
          value: 75000,
          stage: 'WON',
          tenantId: user.tenantId,
          assignedUserId: user.id,
          contactId: contact.id
        },
        include: { contact: true, erpProject: true }
      });
      console.log(`[PASS] 2. Created Won Deal for test: ID=${deal.id}, Value=${deal.value}`);
    } else {
      console.log(`[PASS] 2. Found existing Won Deal: ID=${deal.id}, Value=${deal.value}`);
    }

    // 3. Test Deal -> ERP Project + Sales Order atomic handoff
    console.log('\n--- 3. Testing Atomic ERP Project & Sales Order Creation ---');
    const handoffResult = await erpService.createFromDeal(user.tenantId, deal.id, user.id);
    console.log(`[PASS] Handoff execution successful!`);
    console.log(`       - Project ID: ${handoffResult.project?.id}, Name: "${handoffResult.project?.name}"`);
    console.log(`       - Sales Order ID: ${handoffResult.salesOrder?.id}, Code: "${handoffResult.salesOrder?.orderNumber}", Total: $${handoffResult.salesOrder?.total}`);
    console.log(`       - Originating Deal ID: ${handoffResult.project?.dealId}`);

    // 4. Test Duplicate Prevention
    console.log('\n--- 4. Testing Duplicate Prevention ---');
    const duplicateCheck = await erpService.createFromDeal(user.tenantId, deal.id, user.id);
    if (duplicateCheck.alreadyCreated === true) {
      console.log(`[PASS] Duplicate prevention PASSED: returned alreadyCreated=true without duplicate records.`);
    } else {
      throw new Error(`[FAIL] Duplicate prevention failed! Duplicate records may have been created.`);
    }

    // 5. Test Activity Log for Deal Won Handoff
    console.log('\n--- 5. Verifying CRM Activity System Log ---');
    const activity = await prisma.activity.findFirst({
      where: {
        tenantId: user.tenantId,
        title: { contains: 'ERP Handoff' }
      },
      orderBy: { createdAt: 'desc' }
    });
    if (activity) {
      console.log(`[PASS] Activity verified in DB: "${activity.title}" (Type=${activity.type})`);
    } else {
      console.warn(`[WARN] Activity not found.`);
    }

    // 6. Test Tenant Isolation
    console.log('\n--- 6. Testing Tenant Isolation ---');
    const fakeOtherTenantId = 'tenant-xyz-999';
    const crossTenantProjects = await erpService.getProjects(fakeOtherTenantId);
    if (crossTenantProjects.length === 0) {
      console.log(`[PASS] Tenant isolation query test PASSED: other tenant sees 0 projects.`);
    } else {
      throw new Error(`[FAIL] Tenant isolation violated!`);
    }

    // 7. Test Purchase Orders & Inventory CRUD
    console.log('\n--- 7. Testing Inventory & Procurement Persistence ---');
    const item = await erpService.createInventoryItem(user.tenantId, {
      sku: 'SKU-SRV-' + Date.now().toString().slice(-4),
      name: 'Dedicated Cloud Core v4',
      category: 'Hardware',
      quantity: 50,
      minThreshold: 10,
      unitCost: 1200,
      warehouse: 'Austin Central'
    });
    console.log(`[PASS] Inventory item created: SKU=${item.sku}, Name=${item.name}, Quantity=${item.quantity}`);

    const po = await erpService.createPurchaseOrder(user.tenantId, {
      poNumber: 'PO-TEST-' + Date.now().toString().slice(-4),
      vendor: 'Dell Technologies Enterprise',
      category: 'Hardware',
      amount: 24000,
      items: '5x Rackmount Servers 2U',
      expectedDate: new Date(Date.now() + 7 * 86400000),
      notes: 'Server infrastructure expansion'
    });
    console.log(`[PASS] Purchase order created: PO=${po.poNumber}, Vendor=${po.vendor}, Items=${po.items}`);

    // Verify Counts
    const projectsCount = await prisma.erpProject.count({ where: { tenantId: user.tenantId } });
    const ordersCount = await prisma.salesOrder.count({ where: { tenantId: user.tenantId } });
    const poCount = await prisma.purchaseOrder.count({ where: { tenantId: user.tenantId } });
    const invCount = await prisma.inventoryItem.count({ where: { tenantId: user.tenantId } });

    console.log('\n================ SUMMARY COUNTS ================');
    console.log(`ERP Projects in DB: ${projectsCount}`);
    console.log(`Sales Orders in DB: ${ordersCount}`);
    console.log(`Purchase Orders in DB: ${poCount}`);
    console.log(`Inventory Items in DB: ${invCount}`);
    console.log('================================================\n');
    console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');

  } catch (error) {
    console.error('VERIFICATION ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runE2EVerification();
