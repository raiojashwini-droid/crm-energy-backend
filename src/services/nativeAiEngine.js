const prisma = require('../config/prisma');

const GROK_API_KEY = process.env.GROK_API_KEY || '';
const GROK_BASE_URL = process.env.GROK_BASE_URL || 'https://api.x.ai/v1';
const GROK_MODEL = process.env.GROK_MODEL || 'grok-4.20-0309-non-reasoning';

/**
 * Detect language of query: 'hi' for Hindi/Hinglish, 'en' for English
 */
function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';
  const lower = text.toLowerCase().trim();

  // 1. If message contains Devanagari script, it is definitely Hindi
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }

  // 2. Strong Hinglish vocabulary (words commonly used in Roman Hindi queries)
  const hindiKeywords = [
    'mujhe', 'btao', 'batao', 'dikhao', 'kya', 'hai', 'hain', 'ho', 'kaise', 'karo', 'karna',
    'kitne', 'kitni', 'kitna', 'kaun', 'mera', 'meri', 'mere', 'chahiye', 'hoga', 'hogi',
    'kab', 'kyu', 'kyun', 'kiske', 'kisko', 'namaste', 'shukriya', 'dhanyawad', 'theek',
    'kripya', 'bolo', 'bataiye', 'dikhaye', 'dekhna', 'kaha', 'kahan', 'bhejo', 'aaj', 'kal',
    'bare', 'mein', 'aur', 'bhi', 'sab', 'sabhi'
  ];

  // Tokenize into words to prevent false substring matches on English words
  const words = lower.split(/[^a-zA-Z0-9\u0900-\u097F]+/).filter(Boolean);
  const hasHindiWord = words.some((w) => hindiKeywords.includes(w));

  return hasHindiWord ? 'hi' : 'en';
}

/**
 * Detect intent / topic from message
 */
function detectIntent(text) {
  const lower = text.toLowerCase();
  if (lower.includes('lead') || lower.includes('prospect') || lower.includes('inbound')) return 'leads';
  if (lower.includes('deal') || lower.includes('pipeline') || lower.includes('revenue') || lower.includes('opportunity') || lower.includes('sales')) return 'deals';
  if (lower.includes('contact') || lower.includes('client') || lower.includes('customer') || lower.includes('account')) return 'contacts';
  if (lower.includes('task') || lower.includes('agenda') || lower.includes('todo') || lower.includes('pending')) return 'tasks';
  if (lower.includes('ebox') || lower.includes('zbox') || lower.includes('vault') || lower.includes('encrypt') || lower.includes('secret')) return 'ebox';
  if (lower.includes('erp') || lower.includes('inventory') || lower.includes('warehouse') || lower.includes('supply chain') || lower.includes('bom')) return 'erp';
  if (lower.includes('hr') || lower.includes('ats') || lower.includes('hiring') || lower.includes('recruitment') || lower.includes('payroll') || lower.includes('employee')) return 'hr';
  if (lower.includes('omp') || lower.includes('wholesale') || lower.includes('b2b') || lower.includes('margin')) return 'omp';
  if (lower.includes('swmtp') || lower.includes('mesh') || lower.includes('protocol')) return 'swmtp';
  if (lower.includes('other software') || lower.includes('softwares') || lower.includes('ecosystem') || lower.includes('aur software') || lower.includes('dusre software')) return 'ecosystem';
  if (lower.includes('support') || lower.includes('ticket') || lower.includes('issue')) return 'support';
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('help') || lower.includes('namaste')) return 'greeting';
  return 'general';
}

/**
 * Format currency in USD or INR
 */
function formatCurrency(amount, isHindi = false) {
  const num = Number(amount) || 0;
  if (isHindi) {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
    return `$${num.toLocaleString('en-US')}`;
  }
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Retrieve live CRM context from Prisma for the active tenant
 */
async function getTenantContext(tenantId) {
  const context = {
    leads: [],
    leadStats: { total: 0, byStatus: {}, totalEstimatedValue: 0 },
    deals: [],
    dealStats: { total: 0, byStage: {}, totalValue: 0 },
    tasks: [],
    taskStats: { total: 0, pending: 0, urgent: 0 },
    contactsCount: 0,
    eboxCount: 0,
  };

  try {
    // 1. Leads
    let leads = await prisma.lead.findMany({
      where: tenantId ? { tenantId } : undefined,
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        company: true,
        email: true,
        phone: true,
        status: true,
        score: true,
        estimatedValue: true,
        source: true,
        createdAt: true,
      },
    });

    // If tenant filter yielded 0 results, query all available leads
    if ((!leads || leads.length === 0) && tenantId) {
      leads = await prisma.lead.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          company: true,
          email: true,
          phone: true,
          status: true,
          score: true,
          estimatedValue: true,
          source: true,
          createdAt: true,
        },
      });
    }

    const byStatus = {};
    leads.forEach((l) => {
      const st = l.status || 'NEW';
      byStatus[st] = (byStatus[st] || 0) + 1;
    });

    const totalEstValue = leads.reduce((sum, l) => sum + (Number(l.estimatedValue) || 0), 0);

    context.leads = leads;
    context.leadStats = {
      total: leads.length,
      byStatus,
      totalEstimatedValue: totalEstValue,
    };
  } catch (err) {
    console.warn('[NativeAiEngine] Lead fetch warning:', err.message);
    context.leadStats = { total: 0, byStatus: {}, totalEstimatedValue: 0 };
    context.leads = [];
  }

  try {
    // 2. Deals
    const deals = await prisma.deal.findMany({
      where: tenantId ? { tenantId } : undefined,
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, stage: true, value: true, probability: true },
    });
    context.deals = deals;
    const totalDealVal = deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    context.dealStats = {
      total: deals.length,
      totalValue: totalDealVal,
    };
  } catch (err) {
    context.dealStats = { total: 0, totalValue: 0 };
  }

  try {
    // 3. Tasks
    const tasks = await prisma.task.findMany({
      where: tenantId ? { tenantId } : undefined,
      take: 10,
      orderBy: { dueDate: 'asc' },
    });
    context.tasks = tasks;
    context.taskStats = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'PENDING').length,
      urgent: tasks.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH').length,
    };
  } catch (err) {
    context.taskStats = { total: 0, pending: 0, urgent: 0 };
  }

  return context;
}

/**
 * Call Grok LLM with prompt and system context
 */
async function callGrok(message, systemPrompt) {
  if (!GROK_API_KEY) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8500);

  try {
    const res = await fetch(`${GROK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.35,
        max_tokens: 1000
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[NativeAiEngine] Grok API returned HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    clearTimeout(timeout);
    console.warn(`[NativeAiEngine] Grok invocation warning: ${err.message}`);
    return null;
  }
}

/**
 * Generate high quality context-aware text response
 * Uses the new Advanced AI Engine (Intent Classifier + Response Generator + Live DB + RAG)
 * Falls back to Grok LLM if available for enhanced general intelligence
 */
async function generateNativeResponse(message, user = {}, tenantId = null) {
  const { generateAiResponse } = require('../ai/generator/responseGenerator');

  try {
    // Primary: Use the new Advanced AI Engine (zero-hallucination, live DB, RAG)
    const aiResult = await generateAiResponse(message, {
      ...user,
      tenantId: tenantId || user?.tenantId
    });

    return {
      text: aiResult.text,
      toolExecuted: aiResult.toolExecuted,
      conversationId: `conv_nergy_${Date.now()}`
    };
  } catch (engineErr) {
    console.warn('[NativeAiEngine] Advanced AI Engine error, attempting Grok fallback:', engineErr.message);

    // Fallback: Try Grok LLM if Advanced Engine fails
    const lang = detectLanguage(message);
    const context = await getTenantContext(tenantId || user?.tenantId);
    const userName = user?.name || 'Business Owner';
    const role = user?.role || 'BUSINESS_OWNER';
    const ls = context.leadStats;
    const leadsList = context.leads || [];

    const systemPrompt = `You are Zunme AI, the intelligent Virtual Assistant for CRM nErgy Enterprise.
You have real-time access to live software databases and universal AI intelligence.

### USER CONTEXT:
- Name: ${userName}
- Role: ${role}
- Language detected: ${lang === 'hi' ? 'Hindi/Hinglish' : 'English'}

### LIVE CRM DATA:
- Total Leads: ${ls.total}
- Pipeline Value: ${formatCurrency(ls.totalEstimatedValue, lang === 'hi')}
- Recent Leads:
${leadsList.map((l, i) => `  ${i + 1}. ${l.name} (${l.company || 'N/A'}) - Status: ${l.status}, Value: ${formatCurrency(l.estimatedValue, lang === 'hi')}`).join('\n')}

### RULES:
1. Answer ANY question with deep, accurate, expert-level intelligence.
2. Use ONLY the authentic live CRM numbers above. NEVER invent mock records.
3. Match the user's language.
4. Format with clean Markdown.`;

    const grokAnswer = await callGrok(message, systemPrompt);

    if (grokAnswer) {
      return {
        text: grokAnswer,
        toolExecuted: 'grok_llm_fallback',
        conversationId: `conv_nergy_${Date.now()}`
      };
    }

    // Ultimate fallback
    const isHi = lang === 'hi';
    return {
      text: isHi
        ? `नमस्ते **${userName}** जी! 🙏 मैं **Zunme AI** हूँ। कृपया अपना प्रश्न दोबारा पूछें।`
        : `Hello **${userName}**! 👋 I am **Zunme AI**. Please try your question again.`,
      toolExecuted: 'general_assistance',
      conversationId: `conv_nergy_${Date.now()}`
    };
  }
}

module.exports = {
  detectLanguage,
  detectIntent,
  generateNativeResponse,
  getTenantContext,
  callGrok,
};
