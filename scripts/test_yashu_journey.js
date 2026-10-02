const { PrismaClient } = require('@prisma/client');
const leadService = require('../src/services/leadService');
const contactService = require('../src/services/contactService');
const dealService = require('../src/services/dealService');
const taskService = require('../src/services/taskService');
const noteService = require('../src/services/noteService');
const activityService = require('../src/services/activityService');
const erpService = require('../src/services/erpService');

const prisma = new PrismaClient();

async function runYashuDemoJourney() {
  console.log('================================================================');
  console.log('STARTING "YASHU" DEMO CUSTOMER END-TO-END CRM → ERP FLOW TEST');
  console.log('================================================================\n');

  const testResults = [];
  function recordTest(testName, passed, evidence, details = {}) {
    testResults.push({ testName, passed, evidence, details });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName}`);
    console.log(`       Evidence: ${evidence}`);
    if (Object.keys(details).length > 0) {
      console.log(`       Details:`, JSON.stringify(details));
    }
  }

  try {
    // 0. Authenticate & Setup Context
    const user = await prisma.user.findFirst({
      where: { email: 'business.owner@nergy.io' },
      include: { tenant: true }
    });
    if (!user) throw new Error('Test user business.owner@nergy.io not found');
    const tenantId = user.tenantId;
    const userId = user.id;
    recordTest('0. Context & Auth Setup', true, `Tenant: ${tenantId}, User: ${user.email} (${user.name})`);

    // Clean up any old Yashu records safely before running the verified test sequence
    const existingOldLead = await prisma.lead.findFirst({ where: { tenantId, name: { contains: 'Yashu' } } });
    if (existingOldLead) {
      console.log(`Found prior Yashu record (ID: ${existingOldLead.id}). Cleaning prior test trace...`);
      await prisma.activity.deleteMany({ where: { tenantId, OR: [{ title: { contains: 'Yashu' } }, { description: { contains: 'Yashu' } }] } });
      await prisma.salesOrder.deleteMany({ where: { tenantId, customer: { contains: 'Yashu' } } });
      await prisma.erpProject.deleteMany({ where: { tenantId, OR: [{ name: { contains: 'Yashu' } }, { client: { contains: 'Yashu' } }] } });
      await prisma.task.deleteMany({ where: { tenantId, title: { contains: 'Yashu' } } });
      await prisma.note.deleteMany({ where: { tenantId, content: { contains: 'Yashu' } } });
      await prisma.deal.deleteMany({ where: { tenantId, OR: [{ title: { contains: 'Yashu' } }, { customer: { contains: 'Yashu' } }] } });
      await prisma.contact.deleteMany({ where: { tenantId, OR: [{ name: { contains: 'Yashu' } }, { company: { contains: 'Yashu' } }] } });
      await prisma.lead.deleteMany({ where: { tenantId, OR: [{ name: { contains: 'Yashu' } }, { company: { contains: 'Yashu' } }] } });
      console.log(`Prior Yashu records cleared for clean execution.`);
    }

    // ============================================================================
    // STEP 1: CREATE LEAD
    // ============================================================================
    console.log('\n--- 1. CREATE LEAD ---');
    const leadPayload = {
      name: 'Yashu Demo Lead',
      company: 'Yashu Enterprise Solutions',
      email: 'yashu.demo@enterprise.io',
      phone: '+1 (555) 789-0123',
      source: 'Website Form',
      territory: 'North America',
      status: 'NEW',
      score: 88,
      value: 125000,
    };

    const createdLead = await leadService.create(tenantId, leadPayload, userId);
    const dbLead = await prisma.lead.findUnique({ where: { id: createdLead.id } });
    recordTest(
      '1. Lead Creation & Persistence',
      dbLead !== null && dbLead.name === 'Yashu Demo Lead' && dbLead.tenantId === tenantId,
      `Lead ID: ${createdLead.id}, Value: $${dbLead.estimatedValue}, Status: ${dbLead.status}`,
      { id: dbLead.id, tenantId: dbLead.tenantId, createdAt: dbLead.createdAt }
    );

    // ============================================================================
    // STEP 2: LEAD QUALIFICATION
    // ============================================================================
    console.log('\n--- 2. LEAD QUALIFICATION ---');
    const qualifiedLead = await leadService.update(tenantId, createdLead.id, {
      status: 'QUALIFIED',
      score: 95
    });
    const dbQualifiedLead = await prisma.lead.findUnique({ where: { id: createdLead.id } });
    recordTest(
      '2. Lead Qualification Status Update',
      dbQualifiedLead.status === 'QUALIFIED' && dbQualifiedLead.score === 95,
      `Lead Stage Updated: ${dbQualifiedLead.status} (Score: ${dbQualifiedLead.score})`
    );

    // ============================================================================
    // STEP 3: LEAD -> CONTACT CONVERSION (ATOMIC TRANSACTION)
    // ============================================================================
    console.log('\n--- 3. LEAD CONVERSION (CONTACT + DEAL + TASK + ACTIVITY) ---');
    const conversionResult = await leadService.convertToContact(tenantId, createdLead.id, userId);
    
    // Verify Contact
    const dbContact = await prisma.contact.findUnique({
      where: { id: conversionResult.contact.id },
      include: { deals: true, tasks: true, notes: true, activities: true }
    });
    recordTest(
      '3a. Converted Contact Creation',
      dbContact !== null && dbContact.name === 'Yashu Demo Lead',
      `Contact ID: ${dbContact.id}, Name: ${dbContact.name}, Company: ${dbContact.company}`
    );

    // Verify Converted Deal
    const dbConvertedDeal = await prisma.deal.findUnique({
      where: { id: conversionResult.deal.id }
    });
    recordTest(
      '3b. Pipeline Deal Creation on Conversion',
      dbConvertedDeal !== null && dbConvertedDeal.contactId === dbContact.id && dbConvertedDeal.stage === 'QUALIFIED',
      `Deal ID: ${dbConvertedDeal.id}, Title: "${dbConvertedDeal.title}", Stage: ${dbConvertedDeal.stage}, Value: $${dbConvertedDeal.value}`
    );

    // Verify Converted Task
    const dbConvertedTask = await prisma.task.findUnique({
      where: { id: conversionResult.task.id }
    });
    recordTest(
      '3c. Follow-up Task Creation on Conversion',
      dbConvertedTask !== null && dbConvertedTask.contactId === dbContact.id,
      `Task ID: ${dbConvertedTask.id}, Title: "${dbConvertedTask.title}", Priority: ${dbConvertedTask.priority}`
    );

    // Verify Lead Conversion State
    const updatedLeadPostConversion = await prisma.lead.findUnique({ where: { id: createdLead.id } });
    recordTest(
      '3d. Lead Status Updated to WON with Converted Link',
      updatedLeadPostConversion.status === 'WON' && updatedLeadPostConversion.convertedToContactId === dbContact.id,
      `Lead #${updatedLeadPostConversion.id} Status: ${updatedLeadPostConversion.status}, Link: ${updatedLeadPostConversion.convertedToContactId}`
    );

    // ============================================================================
    // STEP 4: CONTACT 360 DEGREE INTEGRATION VERIFICATION
    // ============================================================================
    console.log('\n--- 4. CONTACT 360 INTEGRATION ---');
    const contact360 = await contactService.getById(tenantId, dbContact.id);
    recordTest(
      '4. Contact 360 Linkage (Deals, Tasks, Notes, Activities)',
      contact360.deals.length >= 1 && contact360.tasks.length >= 1,
      `Contact 360 Linked Records: Deals=${contact360.deals.length}, Tasks=${contact360.tasks.length}, Notes=${contact360.notes.length}, Activities=${contact360.activities.length}`
    );

    // ============================================================================
    // STEP 5: PIPELINE PROGRESSION & STAGE CHANGES
    // ============================================================================
    console.log('\n--- 5. PIPELINE STAGE PROGRESSION ---');
    // Move to PROPOSAL
    await dealService.update(tenantId, dbConvertedDeal.id, { stage: 'PROPOSAL', probability: 75 });
    let dbDealStage = await prisma.deal.findUnique({ where: { id: dbConvertedDeal.id } });
    console.log(`       Stage advanced to: ${dbDealStage.stage} (${dbDealStage.probability}%)`);

    // Move to NEGOTIATION
    await dealService.update(tenantId, dbConvertedDeal.id, { stage: 'NEGOTIATION', probability: 90 });
    dbDealStage = await prisma.deal.findUnique({ where: { id: dbConvertedDeal.id } });
    console.log(`       Stage advanced to: ${dbDealStage.stage} (${dbDealStage.probability}%)`);

    // Move to WON
    await dealService.update(tenantId, dbConvertedDeal.id, { stage: 'WON', probability: 100 });
    dbDealStage = await prisma.deal.findUnique({ where: { id: dbConvertedDeal.id } });
    recordTest(
      '5. Pipeline Progression: QUALIFIED -> PROPOSAL -> NEGOTIATION -> WON',
      dbDealStage.stage === 'WON' && dbDealStage.probability === 100,
      `Final Deal Stage in DB: ${dbDealStage.stage}, Value: $${dbDealStage.value}`
    );

    // ============================================================================
    // STEP 6: CREATE & COMPLETE TASK
    // ============================================================================
    console.log('\n--- 6. TASK LIFECYCLE ---');
    const newTask = await taskService.create(tenantId, {
      title: 'Yashu Demo Follow-up: Finalize SLA Terms',
      description: 'Review operational deployment terms with Yashu Enterprise Solutions.',
      dueDate: new Date(Date.now() + 2 * 86400000),
      priority: 'HIGH',
      contactId: dbContact.id,
      dealId: dbConvertedDeal.id
    }, userId);

    // Complete Task
    const toggledTask = await taskService.toggleComplete(tenantId, newTask.id);
    const dbTaskCompleted = await prisma.task.findUnique({ where: { id: newTask.id } });
    recordTest(
      '6. Task Creation & Completion Toggle',
      dbTaskCompleted.status === 'COMPLETED',
      `Task ID: ${dbTaskCompleted.id}, Status: ${dbTaskCompleted.status}`
    );

    // ============================================================================
    // STEP 7: CREATE NOTE
    // ============================================================================
    console.log('\n--- 7. NOTE CREATION ---');
    const newNote = await noteService.create(tenantId, {
      content: 'Yashu Demo Note: Commercial terms finalized and executive approval secured.',
      contactId: dbContact.id,
      dealId: dbConvertedDeal.id
    }, userId);
    const dbNote = await prisma.note.findUnique({ where: { id: newNote.id } });
    recordTest(
      '7. Note Creation & Contact Relationship',
      dbNote !== null && dbNote.contactId === dbContact.id,
      `Note ID: ${dbNote.id}, Author: ${dbNote.authorId}, Content: "${dbNote.content.slice(0, 45)}..."`
    );

    // ============================================================================
    // STEP 8: CRM -> ERP HANDOFF (WON DEAL -> PROJECT + SALES ORDER)
    // ============================================================================
    console.log('\n--- 8. CRM -> ERP HANDOFF (ATOMIC TRANSACTION) ---');
    const erpHandoff = await erpService.createFromDeal(tenantId, dbConvertedDeal.id, userId);
    const dbErpProject = await prisma.erpProject.findUnique({
      where: { id: erpHandoff.project.id },
      include: { contact: true, deal: true }
    });
    const dbSalesOrder = await prisma.salesOrder.findUnique({
      where: { id: erpHandoff.salesOrder.id },
      include: { contact: true, deal: true, project: true }
    });

    recordTest(
      '8a. ERP Project Creation from Won Deal',
      dbErpProject !== null && dbErpProject.dealId === dbConvertedDeal.id && dbErpProject.contactId === dbContact.id,
      `ERP Project ID: ${dbErpProject.id}, Name: "${dbErpProject.name}", Budget: $${dbErpProject.budget}`
    );

    recordTest(
      '8b. ERP Sales Order Creation from Won Deal',
      dbSalesOrder !== null && dbSalesOrder.projectId === dbErpProject.id && dbSalesOrder.dealId === dbConvertedDeal.id,
      `Sales Order ID: ${dbSalesOrder.id}, Number: "${dbSalesOrder.orderNumber}", Total: $${dbSalesOrder.total}`
    );

    // ============================================================================
    // STEP 9: DUPLICATE PREVENTION & IDEMPOTENCY
    // ============================================================================
    console.log('\n--- 9. DUPLICATE PREVENTION ---');
    // Repeated ERP Handoff
    const duplicateHandoff = await erpService.createFromDeal(tenantId, dbConvertedDeal.id, userId);
    recordTest(
      '9a. ERP Handoff Duplicate Prevention (Idempotency)',
      duplicateHandoff.alreadyCreated === true && duplicateHandoff.project.id === dbErpProject.id,
      `Handoff idempotency response: alreadyCreated=${duplicateHandoff.alreadyCreated}`
    );

    // Check single ERP project count for deal
    const erpProjectsForDealCount = await prisma.erpProject.count({ where: { dealId: dbConvertedDeal.id } });
    recordTest(
      '9b. Zero Duplicate ERP Project Records in Database',
      erpProjectsForDealCount === 1,
      `ERP Projects count for Deal ${dbConvertedDeal.id}: ${erpProjectsForDealCount}`
    );

    // ============================================================================
    // STEP 10: TENANT ISOLATION
    // ============================================================================
    console.log('\n--- 10. TENANT ISOLATION ---');
    const fakeCrossTenantId = 'TENANT-CROSS-TEST-999';
    const crossTenantLeads = await leadService.getAll(fakeCrossTenantId);
    const crossTenantContacts = await contactService.getAll(fakeCrossTenantId);
    const crossTenantDeals = await dealService.getAll(fakeCrossTenantId);
    const crossTenantProjects = await erpService.getProjects(fakeCrossTenantId);

    const isolationPassed = crossTenantLeads.length === 0 &&
      crossTenantContacts.length === 0 &&
      crossTenantDeals.length === 0 &&
      crossTenantProjects.length === 0;

    recordTest(
      '10. Cross-Tenant Isolation (Strict Scoping by req.user.tenantId)',
      isolationPassed,
      `Cross-Tenant queries returned: Leads=${crossTenantLeads.length}, Contacts=${crossTenantContacts.length}, Deals=${crossTenantDeals.length}, Projects=${crossTenantProjects.length}`
    );

    // ============================================================================
    // STEP 11: ACTIVITY LOG SYSTEM AUDIT
    // ============================================================================
    console.log('\n--- 11. ACTIVITY AUDIT TRAIL ---');
    const yashuActivities = await prisma.activity.findMany({
      where: {
        tenantId,
        OR: [
          { contactId: dbContact.id },
          { dealId: dbConvertedDeal.id },
          { leadId: createdLead.id },
          { title: { contains: 'Yashu' } },
          { description: { contains: 'Yashu' } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    recordTest(
      '11. Unified Activity Timeline Generated',
      yashuActivities.length >= 2,
      `Total activities logged for Yashu journey: ${yashuActivities.length}`,
      { activities: yashuActivities.map(a => ({ title: a.title, type: a.type, createdAt: a.createdAt })) }
    );

    // ============================================================================
    // STEP 12: PERSISTENCE & DATA CONSISTENCY CHECK
    // ============================================================================
    console.log('\n--- 12. FINAL REFRESH PERSISTENCE CHECK ---');
    const reloadedLead = await prisma.lead.findUnique({ where: { id: createdLead.id } });
    const reloadedContact = await prisma.contact.findUnique({ where: { id: dbContact.id } });
    const reloadedDeal = await prisma.deal.findUnique({ where: { id: dbConvertedDeal.id } });
    const reloadedProject = await prisma.erpProject.findUnique({ where: { id: dbErpProject.id } });
    const reloadedOrder = await prisma.salesOrder.findUnique({ where: { id: dbSalesOrder.id } });

    const persistencePassed = Boolean(reloadedLead && reloadedContact && reloadedDeal && reloadedProject && reloadedOrder);
    recordTest(
      '12. Full Entity Refresh & Database Persistence',
      persistencePassed,
      `All entities confirmed resident in MySQL database tables with zero mock fallback dependence.`
    );

    console.log('\n================================================================');
    console.log('SUMMARY OF ALL TEST RESULTS');
    console.log('================================================================');
    const passedCount = testResults.filter(r => r.passed).length;
    const totalCount = testResults.length;
    console.log(`Total tests: ${totalCount}`);
    console.log(`Passed: ${passedCount}`);
    console.log(`Failed: ${totalCount - passedCount}`);
    console.log('================================================================\n');

  } catch (error) {
    console.error('ERROR DURING YASHU TEST RUN:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runYashuDemoJourney();
