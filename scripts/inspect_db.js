const prisma = require('../src/config/prisma');

async function main() {
  try {
    const leadsCount = await prisma.lead.count();
    const leads = await prisma.lead.findMany({ take: 10 });
    const dealsCount = await prisma.deal.count();
    const deals = await prisma.deal.findMany({ take: 5 });
    const tasksCount = await prisma.task.count();
    const tasks = await prisma.task.findMany({ take: 5 });
    const contactsCount = await prisma.contact.count();
    const contacts = await prisma.contact.findMany({ take: 5 });
    const usersCount = await prisma.user.count();

    console.log('--- DATABASE INSPECTION ---');
    console.log('Leads Total:', leadsCount);
    console.log('Leads:', JSON.stringify(leads.map(l => ({ id: l.id, name: l.name, company: l.company, status: l.status, value: l.estimatedValue, createdAt: l.createdAt })), null, 2));
    console.log('Deals Total:', dealsCount);
    console.log('Deals:', JSON.stringify(deals.map(d => ({ id: d.id, name: d.name, stage: d.stage, value: d.value })), null, 2));
    console.log('Tasks Total:', tasksCount);
    console.log('Tasks:', JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, status: t.status, priority: t.priority })), null, 2));
    console.log('Contacts Total:', contactsCount);
    console.log('Contacts:', JSON.stringify(contacts.map(c => ({ id: c.id, name: c.name, email: c.email, company: c.company })), null, 2));
    console.log('Users Total:', usersCount);
  } catch (e) {
    console.error('Prisma Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
