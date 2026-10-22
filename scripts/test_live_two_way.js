/**
 * Live End-to-End Two-Way Verification Script
 * Tests live communication between:
 * SWMTP Backend (Port 5000) <---> CRM nErgy Backend (Port 5002)
 */

async function main() {
  console.log('====================================================================');
  console.log('LIVE TWO-WAY VERIFICATION: SWMTP (Port 5000) <--> CRM nErgy (Port 5002)');
  console.log('====================================================================\n');

  try {
    // 1. Authenticate Master Admin on SWMTP
    console.log('Step 1: Logging in as Master Admin on SWMTP (port 5000)...');
    const loginRes = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@swmtp.local', password: 'Admin@123456' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(`SWMTP login failed: ${JSON.stringify(loginData)}`);
    const masterAdminToken = loginData.data.tokens.accessToken;
    console.log('✅ Master Admin authenticated successfully!\n');

    // 2. Select canonical conversation on SWMTP with Vikram Mehta (crm-staff-001)
    console.log('Step 2: Connecting to canonical inter-platform conversation conv-crm-sync (Vikram Mehta)...');
    const conversationId = 'conv-crm-sync';
    console.log(`✅ Using conversation: ID = ${conversationId}\n`);

    // 3. SWMTP Master Admin sends message to CRM nErgy staff
    const adminMessageText = `Live message from SWMTP Master Admin at ${new Date().toISOString()}`;
    console.log(`Step 3: Master Admin dispatching message: "${adminMessageText}"...`);
    const sendMsgRes = await fetch(`http://127.0.0.1:5000/api/v1/internal-chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${masterAdminToken}`
      },
      body: JSON.stringify({
        textContent: adminMessageText,
        messageType: 'text',
        idempotencyKey: `idemp-live-${Date.now()}`
      })
    });
    const sendMsgData = await sendMsgRes.json();
    if (!sendMsgRes.ok) throw new Error(`Failed to send message: ${JSON.stringify(sendMsgData)}`);
    console.log('✅ Message dispatched by SWMTP:', sendMsgData.data.message.deliveries);

    // 4. Verify message landed in CRM nErgy MySQL database
    console.log('\nStep 4: Checking CRM nErgy staff inbox on port 5002...');
    const inboxRes = await fetch('http://127.0.0.1:5002/api/v1/internal-staff/inbox/crm-staff-001');
    const inboxData = await inboxRes.json();
    const received = (inboxData.messages || []).find(m => m.textContent === adminMessageText);
    if (!received) {
      throw new Error(`Message did not arrive in CRM nErgy inbox! Total messages: ${inboxData.count}`);
    }
    console.log('✅ CRM nErgy received message from SWMTP:');
    console.log(`   Ebox ID: ${received.eboxId}`);
    console.log(`   Decrypted Text: "${received.textContent}"`);
    console.log(`   Received At: ${received.receivedAt}\n`);

    // 5. CRM nErgy Staff replies back to SWMTP Master Admin
    const staffReplyText = `Received loud and clear, Master Admin! Vikram Mehta replying from CRM nErgy Secured eBox at ${new Date().toISOString()}`;
    console.log(`Step 5: CRM nErgy staff replying back to SWMTP: "${staffReplyText}"...`);
    const replyRes = await fetch('http://127.0.0.1:5002/api/v1/internal-staff/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        senderStaffId: 'crm-staff-001',
        textContent: staffReplyText,
        idempotencyKey: `crm-reply-live-${Date.now()}`
      })
    });
    const replyData = await replyRes.json();
    if (!replyRes.ok) throw new Error(`Staff reply failed: ${JSON.stringify(replyData)}`);
    console.log('✅ Reply processed and dispatched to SWMTP:', replyData);

    // 6. Verify reply landed in SWMTP conversation message history
    console.log('\nStep 6: Verifying conversation history in SWMTP...');
    const historyRes = await fetch(`http://127.0.0.1:5000/api/v1/internal-chat/conversations/${conversationId}/messages`, {
      headers: { 'Authorization': `Bearer ${masterAdminToken}` }
    });
    const historyData = await historyRes.json();
    const foundReply = (historyData.data?.messages || []).find(m => m.textContent === staffReplyText);
    if (!foundReply) {
      throw new Error(`Reply was not found in SWMTP conversation history! Total: ${historyData.data?.messages?.length}`);
    }
    console.log('✅ SWMTP conversation history verified:');
    console.log(`   Message ID: ${foundReply.id}`);
    console.log(`   Sender: ${foundReply.senderName} (${foundReply.senderPlatformKey})`);
    console.log(`   Content: "${foundReply.textContent}"`);
    console.log(`   Timestamp: ${foundReply.createdAt}\n`);

    console.log('====================================================================');
    console.log('🎉 REAL TWO-WAY INTEGRATION FULLY VERIFIED END-TO-END!');
    console.log('====================================================================');

  } catch (err) {
    console.error('❌ Integration Verification Failed:', err);
    process.exit(1);
  }
}

main();
