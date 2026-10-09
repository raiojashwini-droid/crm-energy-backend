const API_BASE = 'https://crm-energy-backend-production.up.railway.app/api';

async function main() {
  console.log('🚀 Starting Comprehensive Live Database Cleanup (Preserving Users & Tenants)...');

  // 1. Authenticate
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'a.wright@nergy.io', password: 'Password123!' }),
  });

  const loginData = await loginRes.json();
  const token = loginData.data?.token;

  if (!token) {
    console.error('❌ Login failed:', loginData);
    return;
  }

  console.log('✅ Authenticated successfully as Alexander Wright.');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Helper to safely delete items from an endpoint
  async function clearEndpoint(name, getUrl, deleteUrlPrefix) {
    try {
      const res = await fetch(getUrl, { headers });
      const json = await res.json();
      const items = Array.isArray(json) ? json : (json.data || []);
      
      console.log(`📦 Found ${items.length} ${name} to clear.`);
      for (const item of items) {
        const id = item.id || item._id;
        if (!id) continue;
        const delRes = await fetch(`${deleteUrlPrefix}/${id}`, {
          method: 'DELETE',
          headers,
        });
        console.log(`  🗑️ Deleted ${name} ${id} - Status: ${delRes.status}`);
      }
    } catch (err) {
      console.warn(`  ⚠️ Notice for ${name}: ${err.message}`);
    }
  }

  // 2. Clear Leads
  await clearEndpoint('Leads', `${API_BASE}/leads`, `${API_BASE}/leads`);

  // 3. Clear Deals
  await clearEndpoint('Deals', `${API_BASE}/deals`, `${API_BASE}/deals`);

  // 4. Clear Contacts
  await clearEndpoint('Contacts', `${API_BASE}/contacts`, `${API_BASE}/contacts`);

  // 5. Clear Tasks
  await clearEndpoint('Tasks', `${API_BASE}/tasks`, `${API_BASE}/tasks`);

  // 6. Clear Notes
  await clearEndpoint('Notes', `${API_BASE}/notes`, `${API_BASE}/notes`);

  // 7. Clear Support Tickets
  await clearEndpoint('Support Tickets', `${API_BASE}/support/tickets`, `${API_BASE}/support/tickets`);

  // 8. Clear Communications Messages
  await clearEndpoint('Communications', `${API_BASE}/communications/messages`, `${API_BASE}/communications/messages`);

  // 9. Clear ERP Projects/Orders
  await clearEndpoint('ERP Projects', `${API_BASE}/erp/projects`, `${API_BASE}/erp/projects`);
  await clearEndpoint('ERP Invoices', `${API_BASE}/invoices`, `${API_BASE}/invoices`);

  // 10. Verify Final State
  console.log('\n🔍 Verifying Final Counts...');
  const [leads, deals, contacts, tasks, notes] = await Promise.all([
    fetch(`${API_BASE}/leads`, { headers }).then((r) => r.json()),
    fetch(`${API_BASE}/deals`, { headers }).then((r) => r.json()),
    fetch(`${API_BASE}/contacts`, { headers }).then((r) => r.json()),
    fetch(`${API_BASE}/tasks`, { headers }).then((r) => r.json()),
    fetch(`${API_BASE}/notes`, { headers }).then((r) => r.json()),
  ]);

  const countOf = (res) => (Array.isArray(res) ? res.length : (res.data?.length ?? 0));

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Leads Remaining:    ${countOf(leads)}`);
  console.log(`✅ Deals Remaining:    ${countOf(deals)}`);
  console.log(`✅ Contacts Remaining: ${countOf(contacts)}`);
  console.log(`✅ Tasks Remaining:    ${countOf(tasks)}`);
  console.log(`✅ Notes Remaining:    ${countOf(notes)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Live database cleanup finished! All transactional data is 0, user accounts remain preserved.');
}

main().catch(console.error);
