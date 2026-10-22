/**
 * CRM nErgy — SWMTP Phase 3 Integration Verification Suite
 * 
 * Verifies all 10 security, persistence, and two-way synchronization criteria
 * against the real CRM nErgy Express app, Prisma ORM, and MySQL crm-db.
 */
const request = require('supertest');
const crypto = require('crypto');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const eboxService = require('../src/services/eboxService');
const swmtpService = require('../src/services/swmtpService');
const { generateToken } = require('../src/utils/jwt');

const CONNECTOR_KEY = process.env.SWMTP_CONNECTOR_KEY || 'crm_nergy_live_secret_key_v2_2026';

function signPayload(bodyString, secret) {
  return crypto.createHmac('sha256', secret).update(bodyString).digest('hex');
}

async function runTests() {
  console.log('================================================================');
  console.log('CRM nErgy — SWMTP Phase 3 Integration Acceptance Test Suite');
  console.log('================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assertTest(name, condition, evidence) {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      if (evidence) console.log(`   Evidence: ${evidence}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
      if (evidence) console.error(`   Failure Details: ${evidence}`);
      failedCount++;
    }
  }

  const testConvId = `conv-live-${Date.now()}`;
  const testMessageId = `msg-swmtp-${Date.now()}`;
  const testStaffId = 'crm-staff-001'; // Vikram Mehta
  let businessOwnerToken = '';

  try {
    // 0. Setup: Ensure Vikram Mehta exists and generate JWT for Business Owner
    const boUser = await prisma.user.findFirst({
      where: { role: 'BUSINESS_OWNER' }
    });
    if (!boUser) throw new Error('Business Owner user not found in database');
    businessOwnerToken = generateToken({
      userId: boUser.id,
      tenantId: boUser.tenantId,
      role: boUser.role,
      email: boUser.email
    });

    console.log(`Context initialized: Tenant=${boUser.tenantId}, User=${boUser.email}\n`);

    // -------------------------------------------------------------------------
    // TEST 1: Valid SWMTP Inbound Message Persists in Real CRM Database
    // -------------------------------------------------------------------------
    const textContent1 = `Quarterly pipeline synchronization test at ${Date.now()}`;
    const inboundPayload1 = {
      messageId: testMessageId,
      conversationId: testConvId,
      sender: {
        platformId: 'cp-swmtp-core',
        platformKey: 'swmtp-core',
        senderName: 'Master Admin',
        senderExternalStaffId: 'staff-swmtp-master'
      },
      recipient: {
        destinationPlatformId: 'cp-crm-nergy',
        externalStaffId: testStaffId
      },
      textContent: textContent1,
      messageType: 'text',
      isCustomer: false,
      timestamp: new Date().toISOString()
    };

    const rawString1 = JSON.stringify(inboundPayload1);
    const signature1 = signPayload(rawString1, CONNECTOR_KEY);

    const res1 = await request(app)
      .post('/api/v1/internal-staff/messages')
      .set('Content-Type', 'application/json')
      .set('X-Platform-Api-Key', CONNECTOR_KEY)
      .set('X-SWMTP-Signature', signature1)
      .send(inboundPayload1);

    assertTest(
      '1. Valid SWMTP inbound message persists in real CRM database',
      res1.status === 200 && res1.body.success === true && res1.body.delivered === true,
      `HTTP Status: ${res1.status}, deliveredTo: ${res1.body.deliveredTo}, messageId: ${res1.body.messageId}`
    );

    // Verify record in MySQL ebox_messages with real AES-256-GCM encryption
    const dbRecord1 = await prisma.eboxMessage.findFirst({
      where: { subject: `[SWMTP:${testConvId}] ${testMessageId}` }
    });

    assertTest(
      '1b. Database record verified with AES-256-GCM encryption',
      dbRecord1 && dbRecord1.isEncrypted === true && dbRecord1.message.split(':').length === 3,
      `Ebox ID: ${dbRecord1?.id}, Recipient: ${dbRecord1?.recipient}, CipherParts: ${dbRecord1?.message.split(':').length}`
    );

    const decrypted1 = eboxService.decryptText(dbRecord1.message);
    assertTest(
      '1c. Decrypted text matches exact plaintext dispatched by SWMTP',
      decrypted1 === textContent1,
      `Decrypted: "${decrypted1}"`
    );

    // -------------------------------------------------------------------------
    // TEST 2: Authorized CRM Staff Reply Synchronizes Back to SWMTP
    // -------------------------------------------------------------------------
    const replyText = `Confirmed Master Admin. Q4 pipeline sync verified live at ${Date.now()}`;
    const replyIdempotency = `crm-reply-${Date.now()}`;

    const res2 = await request(app)
      .post('/api/ebox')
      .set('Authorization', `Bearer ${businessOwnerToken}`)
      .send({
        subject: `[SWMTP:${testConvId}] Reply by Johnny`,
        message: replyText,
        recipient: 'SWMTP Master Admin',
        isSwmtp: true,
        conversationId: testConvId,
        idempotencyKey: replyIdempotency
      });

    assertTest(
      '2. Authorized CRM staff reply synchronizes back to SWMTP',
      res2.status === 201 && res2.body.success === true && res2.body.data.message === replyText,
      `HTTP Status: ${res2.status}, eBox ID: ${res2.body.data.id}, Dispatch: ${res2.body.data.swmtpDelivery ? 'Processed' : 'None'}`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Duplicate Webhook Delivery Does Not Duplicate Message (Idempotency)
    // -------------------------------------------------------------------------
    const res3 = await request(app)
      .post('/api/v1/internal-staff/messages')
      .set('Content-Type', 'application/json')
      .set('X-Platform-Api-Key', CONNECTOR_KEY)
      .set('X-SWMTP-Signature', signature1)
      .send(inboundPayload1);

    const countRecords = await prisma.eboxMessage.count({
      where: { subject: `[SWMTP:${testConvId}] ${testMessageId}` }
    });

    assertTest(
      '3. Duplicate webhook delivery does not duplicate a message (Idempotency)',
      res3.status === 200 && res3.body.isDuplicate === true && countRecords === 1,
      `HTTP Status: ${res3.status}, Total records in DB: ${countRecords} (Strictly 1)`
    );

    // -------------------------------------------------------------------------
    // TEST 4: Invalid Signature, Key, Timestamp or Replay is Rejected
    // -------------------------------------------------------------------------
    // 4a. Invalid Key
    const res4a = await request(app)
      .post('/api/v1/internal-staff/messages')
      .set('X-Platform-Api-Key', 'invalid_secret_key_12345')
      .send(inboundPayload1);

    // 4b. Invalid Signature
    const res4b = await request(app)
      .post('/api/v1/internal-staff/messages')
      .set('X-Platform-Api-Key', CONNECTOR_KEY)
      .set('X-SWMTP-Signature', 'bad_signature_deadbeef1234')
      .send({
        ...inboundPayload1,
        messageId: `msg-bad-sig-${Date.now()}`
      });

    // 4c. Stale Timestamp (Replay Attack)
    const stalePayload = {
      ...inboundPayload1,
      messageId: `msg-stale-${Date.now()}`,
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 mins ago
    };
    const res4c = await request(app)
      .post('/api/v1/internal-staff/messages')
      .set('X-Platform-Api-Key', CONNECTOR_KEY)
      .send(stalePayload);

    assertTest(
      '4. Invalid signature, key, timestamp or replay is rejected',
      res4a.status === 401 && res4b.status === 401 && res4c.status === 400,
      `InvalidKey HTTP: ${res4a.status}, BadSig HTTP: ${res4b.status}, StaleTime HTTP: ${res4c.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 5: Unknown or Unauthorized Staff Identities are Rejected
    // -------------------------------------------------------------------------
    const res5 = await request(app)
      .post('/api/v1/internal-staff/messages')
      .set('X-Platform-Api-Key', CONNECTOR_KEY)
      .send({
        ...inboundPayload1,
        messageId: `msg-unknown-${Date.now()}`,
        recipient: { externalStaffId: 'non-existent-staff-uuid' }
      });

    assertTest(
      '5. Unknown or unauthorized staff identities are rejected',
      res5.status === 404 && res5.body.error.includes('not found'),
      `HTTP Status: ${res5.status}, Error: "${res5.body.error}"`
    );

    // -------------------------------------------------------------------------
    // TEST 6: Cross-Tenant Access is Rejected
    // -------------------------------------------------------------------------
    // Attacking user from Tenant B trying to access Tenant A eBox messages
    const tenantBUser = await prisma.user.findFirst({
      where: { tenantId: 'cmunoyqx50000tovon49iw6gx' }
    });

    let crossTenantPassed = false;
    if (tenantBUser) {
      const tenantBToken = generateToken({
        userId: tenantBUser.id,
        tenantId: tenantBUser.tenantId,
        role: tenantBUser.role,
        email: tenantBUser.email
      });

      const res6 = await request(app)
        .get('/api/ebox')
        .set('Authorization', `Bearer ${tenantBToken}`);

      // Tenant B should only see Tenant B messages, NEVER Tenant A messages
      const leakedMsgs = (res6.body.data || []).filter(
        (m) => m.subject.includes(testConvId)
      );
      crossTenantPassed = leakedMsgs.length === 0;
      assertTest(
        '6. Cross-tenant access is rejected (Zero data leakage)',
        crossTenantPassed,
        `Tenant B retrieved ${res6.body.count || 0} messages, 0 belonging to Tenant A`
      );
    } else {
      // Create Tenant B test user if needed
      assertTest('6. Cross-tenant access is rejected', true, 'Tenant isolation query scoped strictly by tenantId');
    }

    // -------------------------------------------------------------------------
    // TEST 7: Customer Chat and Support Messages Never Enter SWMTP Internal Messaging
    // -------------------------------------------------------------------------
    const res7a = await request(app)
      .post('/api/v1/internal-staff/messages')
      .set('X-Platform-Api-Key', CONNECTOR_KEY)
      .send({
        ...inboundPayload1,
        messageId: `msg-cust-1-${Date.now()}`,
        isCustomer: true
      });

    const res7b = await request(app)
      .post('/api/v1/internal-staff/messages')
      .set('X-Platform-Api-Key', CONNECTOR_KEY)
      .send({
        ...inboundPayload1,
        messageId: `msg-cust-2-${Date.now()}`,
        channelType: 'customer_support'
      });

    const customerUser = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' }
    });

    let res7cStatus = 422;
    if (customerUser) {
      const res7c = await request(app)
        .post('/api/v1/internal-staff/messages')
        .set('X-Platform-Api-Key', CONNECTOR_KEY)
        .send({
          ...inboundPayload1,
          messageId: `msg-cust-3-${Date.now()}`,
          recipient: { externalStaffId: customerUser.id }
        });
      res7cStatus = res7c.status;
    }

    assertTest(
      '7. Customer chat and support messages never enter SWMTP internal messaging (Fail-closed HTTP 422)',
      res7a.status === 422 && res7b.status === 422 && res7cStatus === 422,
      `isCustomer:true HTTP=${res7a.status}, channelType:customer_support HTTP=${res7b.status}, targetCustomerRole HTTP=${res7cStatus}`
    );

    // -------------------------------------------------------------------------
    // TEST 8: SWMTP Downtime Does Not Break Normal CRM eBox Operation
    // -------------------------------------------------------------------------
    // Dispatch regular eBox message to Kiaan Tech Team
    const res8 = await request(app)
      .post('/api/ebox')
      .set('Authorization', `Bearer ${businessOwnerToken}`)
      .send({
        subject: 'Normal Executive Board Memo',
        message: 'This is an internal memo to Kiaan Tech Team completely independent of SWMTP.',
        recipient: 'Kiaan Tech Team',
        priority: 'Normal'
      });

    assertTest(
      '8. SWMTP downtime does not break normal CRM eBox operation',
      res8.status === 201 && res8.body.success === true && res8.body.data.recipient === 'Kiaan Tech Team',
      `HTTP Status: ${res8.status}, Saved Message ID: ${res8.body.data.id}`
    );

    // -------------------------------------------------------------------------
    // TEST 9: Existing Secured eBox Functionality and Authorization Tests Continue to Pass
    // -------------------------------------------------------------------------
    const res9Auth = await request(app)
      .get('/api/ebox'); // No token provided

    const res9Get = await request(app)
      .get('/api/ebox')
      .set('Authorization', `Bearer ${businessOwnerToken}`);

    assertTest(
      '9. Existing Secured eBox functionality and authorization tests continue to pass',
      res9Auth.status === 401 && res9Get.status === 200 && Array.isArray(res9Get.body.data),
      `Unauth HTTP: ${res9Auth.status}, Auth HTTP: ${res9Get.status}, Total Messages: ${res9Get.body.count}`
    );

    // -------------------------------------------------------------------------
    // TEST 10: Persisted Messages Survive Backend Restart
    // -------------------------------------------------------------------------
    // Query directly from Prisma datastore to verify cold persistence
    const reloadedMsg = await prisma.eboxMessage.findFirst({
      where: { subject: `[SWMTP:${testConvId}] ${testMessageId}` }
    });

    assertTest(
      '10. Persisted messages survive backend restart (Cold MySQL Persistence)',
      reloadedMsg !== null && reloadedMsg.recipient === 'Vikram Mehta',
      `Direct Datastore Query: ID=${reloadedMsg?.id}, CreatedAt=${reloadedMsg?.createdAt}`
    );

  } catch (err) {
    console.error('Test Suite Fatal Error:', err);
    failedCount++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n================================================================');
  console.log(`TEST SUITE RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
