const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CRM nErgy database seeding...');

  // 1. Create or Find Primary Tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: 'TENANT-08492' },
    update: {},
    create: {
      id: 'TENANT-08492',
      name: 'nErgy Enterprise Logistics',
      domain: 'nergy.io',
      subscription: 'ACTIVE',
    },
  });

  console.log(`✅ Tenant verified: ${tenant.name} (${tenant.id})`);

  // 2. Default Password Hash for Demo Users
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 3. Seed All 12 CRM Demo Personas
  const demoUsers = [
    { name: 'Alexander Wright', email: 'a.wright@nergy.io', role: 'BUSINESS_OWNER' },
    { name: 'Leo Fontaine', email: 'l.fontaine@nergy.io', role: 'CONTENT_CREATOR' },
    { name: 'Chloe Rivera', email: 'c.rivera@nergy.io', role: 'INFLUENCER' },
    { name: 'Tanya Sterling', email: 't.sterling@nergy.io', role: 'AI_MARKETING_PRO' },
    { name: 'Sarah Jenkins', email: 's.jenkins@nergy.io', role: 'OPERATIONS_SALES_ADMIN' },
    { name: 'Marcus Vance', email: 'm.vance@nergy.io', role: 'CRM_PRO' },
    { name: 'Dr. Aris Thorne', email: 'a.thorne@biogenix.org', role: 'CUSTOMER' },
    { name: 'Client Portal User', email: 'client.portal@nexusventures.com', role: 'CUSTOMER' },
    { name: 'Maya Lin', email: 'm.lin@nergy.io', role: 'CONTENT_BUILDER' },
    { name: 'David Novak', email: 'd.novak@nergy.io', role: 'CONTENT_BUILDER' },
    { name: 'Julian Vance', email: 'j.vance@nergypartners.net', role: 'AFFILIATE_PARTNER' },
    { name: 'Robert Chen', email: 'r.chen@globalapex.com', role: 'AFFILIATE_PARTNER' },
    { name: 'Elena Rostova', email: 'e.rostova@nergy.io', role: 'HR' },
    { name: 'Eva Ross', email: 'e.ross@nergy.io', role: 'HR' },
    { name: 'David Chen', email: 'd.chen@nergy.io', role: 'FINANCE_COMPLIANCE_ADMIN' },
    { name: 'Javier Ramirez', email: 'j.ramirez@nergy.io', role: 'FINANCE_COMPLIANCE_ADMIN' },
    { name: 'Root Super Admin', email: 'root.superadmin@nergy.io', role: 'SUPER_ADMIN' },
    { name: 'Super Administrator', email: 'superadmin@nergy.io', role: 'SUPER_ADMIN' },
  ];

  const userMap = {};
  for (const u of demoUsers) {
    const createdUser = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: u.email } },
      update: { role: u.role, isActive: true },
      create: {
        tenantId: tenant.id,
        name: u.name,
        email: u.email,
        passwordHash: defaultPasswordHash,
        role: u.role,
        isActive: true,
      },
    });
    userMap[u.email] = createdUser;
  }

  const alexander = userMap['a.wright@nergy.io'];
  const sarah = userMap['s.jenkins@nergy.io'];
  const marcus = userMap['m.vance@nergy.io'];

  console.log('✅ All 12 CRM demo user personas seeded successfully');

  // 4. Seed Contacts
  const contact1 = await prisma.contact.create({
    data: {
      tenantId: tenant.id,
      assignedUserId: alexander.id,
      name: 'Dr. Aris Thorne',
      company: 'BioGenix Labs Inc.',
      email: 'a.thorne@biogenix.org',
      phone: '+1 (555) 349-8821',
      type: 'Enterprise Client',
      title: 'Chief Science Officer',
      status: 'Active',
      totalValue: 850000.0,
      lastActivity: new Date(),
    },
  });

  const contact2 = await prisma.contact.create({
    data: {
      tenantId: tenant.id,
      assignedUserId: sarah.id,
      name: 'Eleanor Vance',
      company: 'Vanguard Freight Corp',
      email: 'e.vance@vanguardfreight.com',
      phone: '+1 (555) 778-1920',
      type: 'Logistics Partner',
      title: 'VP Operations',
      status: 'Active',
      totalValue: 420000.0,
      lastActivity: new Date(),
    },
  });

  const contact3 = await prisma.contact.create({
    data: {
      tenantId: tenant.id,
      assignedUserId: marcus.id,
      name: 'Hiroshi Tanaka',
      company: 'NeoTokyo Microgrid',
      email: 'h.tanaka@neotokyo.jp',
      phone: '+81 3 5555 0142',
      type: 'Key Account',
      title: 'Managing Director',
      status: 'Active',
      totalValue: 1200000.0,
      lastActivity: new Date(),
    },
  });

  console.log('✅ Contacts seeded');

  // 5. Seed Leads
  const lead1 = await prisma.lead.create({
    data: {
      tenantId: tenant.id,
      assignedUserId: sarah.id,
      name: 'Klaus Reinhardt',
      company: 'Bavaria Solar Dynamics',
      email: 'k.reinhardt@bavariasolar.de',
      phone: '+49 89 2020 4433',
      source: 'Direct Outreach',
      territory: 'EMEA',
      status: 'QUALIFIED',
      score: 92,
      estimatedValue: 450000.0,
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      tenantId: tenant.id,
      assignedUserId: marcus.id,
      name: 'Chloe Lin',
      company: 'Apex Robotics USA',
      email: 'c.lin@apexrobotics.io',
      phone: '+1 (555) 883-9901',
      source: 'Inbound Web',
      territory: 'North America',
      status: 'NEW',
      score: 78,
      estimatedValue: 280000.0,
    },
  });

  const lead3 = await prisma.lead.create({
    data: {
      tenantId: tenant.id,
      assignedUserId: alexander.id,
      name: 'Siddharth Menon',
      company: 'Indus Grid Solutions',
      email: 's.menon@indusgrid.in',
      phone: '+91 22 4000 8899',
      source: 'Conference',
      territory: 'APAC',
      status: 'PROPOSAL',
      score: 85,
      estimatedValue: 620000.0,
    },
  });

  console.log('✅ Leads seeded');

  // 6. Seed Deals / Pipeline
  const deal1 = await prisma.deal.create({
    data: {
      tenantId: tenant.id,
      contactId: contact1.id,
      assignedUserId: alexander.id,
      title: 'BioGenix Global Cold-Chain Contract',
      customer: 'BioGenix Labs Inc.',
      value: 850000.0,
      stage: 'NEGOTIATION',
      probability: 80,
      expectedClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      description: 'End-to-end multi-region vaccine and cold-chain temperature telemetry.',
    },
  });

  const deal2 = await prisma.deal.create({
    data: {
      tenantId: tenant.id,
      contactId: contact2.id,
      assignedUserId: sarah.id,
      title: 'Vanguard Autonomous Route Pilot',
      customer: 'Vanguard Freight Corp',
      value: 420000.0,
      stage: 'PROPOSAL',
      probability: 60,
      expectedClose: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      description: '15-node autonomous fleet route optimization and live ETA feeds.',
    },
  });

  const deal3 = await prisma.deal.create({
    data: {
      tenantId: tenant.id,
      contactId: contact3.id,
      assignedUserId: marcus.id,
      title: 'NeoTokyo Microgrid Smart Feeder Phase 1',
      customer: 'NeoTokyo Microgrid',
      value: 1200000.0,
      stage: 'QUALIFIED',
      probability: 50,
      expectedClose: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      description: 'Renewable grid balancer with IoT telemetry and dynamic pricing.',
    },
  });

  console.log('✅ Deals seeded');

  // 7. Seed Tasks
  await prisma.task.create({
    data: {
      tenantId: tenant.id,
      assignedUserId: alexander.id,
      dealId: deal1.id,
      contactId: contact1.id,
      title: 'Deliver revised MSA draft to BioGenix Legal',
      description: 'Finalize liability cap and SLA uptime clauses before Friday sign-off.',
      priority: 'URGENT',
      status: 'PENDING',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      reminder: '9:00 AM',
    },
  });

  await prisma.task.create({
    data: {
      tenantId: tenant.id,
      assignedUserId: sarah.id,
      leadId: lead1.id,
      title: 'Schedule technical feasibility call with Klaus Reinhardt',
      description: 'Review EMEA compliance standards and solar panel sensor protocols.',
      priority: 'HIGH',
      status: 'PENDING',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      reminder: '2:30 PM',
    },
  });

  await prisma.task.create({
    data: {
      tenantId: tenant.id,
      assignedUserId: marcus.id,
      contactId: contact3.id,
      title: 'Send Tokyo hardware benchmark specs sheet',
      description: 'Follow up on technical telemetry requirements for smart feeders.',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      dueDate: new Date(),
      reminder: '11:00 AM',
    },
  });

  console.log('✅ Tasks seeded');

  // 8. Seed Activities
  await prisma.activity.create({
    data: {
      tenantId: tenant.id,
      userId: alexander.id,
      dealId: deal1.id,
      type: 'STAGE_CHANGED',
      title: 'Deal moved to Negotiation',
      description: 'BioGenix executive committee approved proposal scope.',
    },
  });

  await prisma.activity.create({
    data: {
      tenantId: tenant.id,
      userId: sarah.id,
      leadId: lead1.id,
      type: 'CALL_LOGGED',
      title: 'Discovery call held with Bavaria Solar Dynamics',
      description: 'Discussed Q4 expansion into German industrial hubs.',
    },
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
