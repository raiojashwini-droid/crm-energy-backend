/**
 * Advanced Multi-Intent Classifier for Ask Zunme AI
 * Classifies queries into:
 *  - 'LIVE_CRM_QUERY' (live database lookups: leads, deals, tasks, contacts, today's leads, lead by name)
 *  - 'SOFTWARE_KNOWLEDGE' (CRM nErgy documentation, menus, routes, modules, workflows, eBox, RBAC)
 *  - 'GENERAL_INTELLIGENCE' (programming, React, MySQL, RAG, REST APIs, general technical/world knowledge)
 *  - 'GREETING' (hello, hi, namaste, who are you)
 */

const { detectLanguage } = require('../knowledge/crmKnowledgeBase') || {};

function detectQueryLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';

  const hindiKeywords = [
    'mujhe', 'btao', 'batao', 'dikhao', 'kya', 'hai', 'hain', 'ho', 'kaise', 'karo', 'karna',
    'kitne', 'kitni', 'kitna', 'kaun', 'mera', 'meri', 'mere', 'chahiye', 'hoga', 'hogi',
    'kab', 'kyu', 'kyun', 'kiske', 'kisko', 'namaste', 'shukriya', 'dhanyawad', 'theek',
    'kripya', 'bolo', 'bataiye', 'dikhaye', 'dekhna', 'kaha', 'kahan', 'bhejo', 'aaj', 'kal',
    'bare', 'mein', 'aur', 'bhi', 'sab', 'sabhi'
  ];

  const words = text.toLowerCase().split(/[^a-zA-Z0-9\u0900-\u097F]+/).filter(Boolean);
  const hasHindiWord = words.some((w) => hindiKeywords.includes(w));
  return hasHindiWord ? 'hi' : 'en';
}

function classifyIntent(text) {
  if (!text || typeof text !== 'string') {
    return { intent: 'GREETING', subIntent: 'greeting', language: 'en', entities: {} };
  }

  const raw = text.trim();
  const lower = raw.toLowerCase();
  const language = detectQueryLanguage(raw);

  // 1. Check Greeting first if very short
  const greetingPatterns = [
    /^(hi|hello|hey|namaste|pranam|salam|greetings|hola|good morning|good afternoon|good evening)[\s!.]*$/i,
    /^(who are you|tum kaun ho|who made you|kya ho tum|tell me about yourself)[\s?!.]*$/i
  ];
  if (greetingPatterns.some(p => p.test(lower))) {
    return {
      intent: 'GREETING',
      subIntent: 'greeting',
      language,
      entities: {}
    };
  }

  // 1b. Check Date / Time queries (e.g. "today what date", "aaj konsi date hai", "what is today's date")
  const dateTimePatterns = [
    /\b(what.*date|today.*date|date.*today|aaj.*(date|tarikh|din)|current.*(date|time|day)|what day is (it|today)|konsi date)\b/i,
    /\b(what is the date|what is today's date|today's date|today date|current date|what date is it)\b/i
  ];
  const isCrmEntityQuery = /\b(lead|deal|task|contact|pipeline|inbound|value)\b/i.test(lower);
  if (dateTimePatterns.some(p => p.test(lower)) && !isCrmEntityQuery) {
    return {
      intent: 'DATE_TIME',
      subIntent: 'current_date',
      language,
      entities: {}
    };
  }

  // Extract entities for CRM live queries
  const entities = {
    personName: null,
    isToday: false,
    entityType: null, // lead, deal, task, contact
  };

  // Check for specific lead names in database (Jordan Reed, FVCX, abd, Stiv Smith)
  const nameMatch = raw.match(/['"]([^'"]+)['"]/);
  if (nameMatch) {
    entities.personName = nameMatch[1].trim();
  } else if (/jordan\s*reed/i.test(lower)) {
    entities.personName = 'Jordan Reed';
  } else if (/fvcx/i.test(lower)) {
    entities.personName = 'FVCX';
  } else if (/\babd\b/i.test(lower)) {
    entities.personName = 'abd';
  } else if (/stiv\s*smith/i.test(lower)) {
    entities.personName = 'Stiv Smith';
  }

  if (/\b(today|aaj|today's|created today|added today)\b/i.test(lower)) {
    entities.isToday = true;
  }

  // 2. LIVE CRM QUERY Patterns (live database records, counts, specific person lookup)
  const liveCountPatterns = [
    /how many (leads|deals|tasks|contacts)/i,
    /kitne (leads|deals|tasks|contacts|kaam)/i,
    /kitni (leads|deals)/i,
    /total value/i,
    /kul mulya/i,
    /currently have/i,
    /right now/i,
    /in (our|the) database/i,
    /active deals/i,
    /pending (tasks|kaam)/i,
    /currently pending/i,
    /find (the )?lead/i,
    /show (me )?all leads/i,
    /status.*score.*contact/i,
    /leads created today/i,
    /pipeline value/i,
    /what tasks/i,
    /tasks.*pending|pending.*tasks/i,
  ];

  const isLiveExplicit = liveCountPatterns.some(p => p.test(lower)) || (entities.personName && /lead|contact|status|score|info/i.test(lower));

  if (isLiveExplicit) {
    let subIntent = 'leads';
    if (/deal|pipeline/i.test(lower) && !entities.personName) subIntent = 'deals';
    else if (/task|pending/i.test(lower) && !entities.personName) subIntent = 'tasks';
    else if (/contact/i.test(lower) && !entities.personName && !/lead/i.test(lower)) subIntent = 'contacts';
    else if (entities.personName) subIntent = 'lead_search';
    else if (entities.isToday) subIntent = 'leads_today';

    return {
      intent: 'LIVE_CRM_QUERY',
      subIntent,
      language,
      entities
    };
  }

  // 3. GENERAL INTELLIGENCE Patterns (Programming, Technical, General concepts)
  // Check for coding concepts: React, useState, useEffect, node, express, mysql, join, inner join, rag, rest api, etc.
  const generalTechPatterns = [
    /\b(usestate|useeffect|usecontext|usememo|usecallback|usereducer|react)\b/i,
    /\b(inner join|left join|right join|cross join|outer join|mysql|sql query)\b/i,
    /\b(express route|express\.js|nodejs|node\.js|validate an email|email validation route)\b/i,
    /\b(rag|retrieval-augmented generation|vector database|embeddings|retrieval augmented)\b/i,
    /\b(rest api|http methods|status code|graphql|websocket)\b/i,
    /\b(python script|javascript function|async await|promise|typescript)\b/i,
    /\b(difference between|how does .* work step by step|write a .* route|explain the difference)\b/i
  ];

  // If matches general tech and does NOT specifically ask about CRM nErgy modules/routes
  const isCrmSpecific = /\b(crm|nergy|crm nErgy|ebox|zbox|swmtp|ai studio|lead management lifecycle|deal pipeline stages)\b/i.test(lower);

  const isGeneralTech = generalTechPatterns.some(p => p.test(lower));

  if (isGeneralTech && !isCrmSpecific) {
    return {
      intent: 'GENERAL_INTELLIGENCE',
      subIntent: 'technical',
      language,
      entities
    };
  }

  // 4. SOFTWARE KNOWLEDGE Patterns (CRM nErgy architecture, modules, menus, RBAC, eBox, workflows)
  const softwareKnowledgePatterns = [
    /\b(modules?|sidebar|menu|navigation|features?|workflows?)\b/i,
    /\b(lead management lifecycle|capture to conversion|how do i convert)\b/i,
    /\b(deal pipeline stages?|stages in crm nErgy|funnel)\b/i,
    /\b(secured (zbox|ebox)|ebox|zbox|aes-256|vault security)\b/i,
    /\b(rbac|role-based|permissions|roles|executive.*manager|access control)\b/i,
    /\b(ai studio|where do i find the ai studio)\b/i,
    /\b(how (do|can) i create a new task|assign it to a team member)\b/i,
    /\b(how does .* work in crm nErgy|how to .* in crm nErgy)\b/i,
    /\b(customer support|hr & recruiting|reports hub|settings)\b/i
  ];

  const isSoftwareKnowledge = softwareKnowledgePatterns.some(p => p.test(lower)) || isCrmSpecific;

  if (isSoftwareKnowledge) {
    let subIntent = 'general_knowledge';
    if (/module|sidebar|menu/i.test(lower)) subIntent = 'modules';
    else if (/lead.*lifecycle|conversion/i.test(lower)) subIntent = 'lead_lifecycle';
    else if (/stage|pipeline stages/i.test(lower)) subIntent = 'pipeline_stages';
    else if (/ebox|zbox|vault/i.test(lower)) subIntent = 'ebox_security';
    else if (/role|rbac|permission/i.test(lower)) subIntent = 'rbac';
    else if (/ai studio/i.test(lower)) subIntent = 'ai_studio';
    else if (/task.*assign|create.*task/i.test(lower)) subIntent = 'create_task';

    return {
      intent: 'SOFTWARE_KNOWLEDGE',
      subIntent,
      language,
      entities
    };
  }

  // Secondary check for general questions
  if (/\b(explain|what is|how to|write|code|difference|why|when)\b/i.test(lower)) {
    return {
      intent: 'GENERAL_INTELLIGENCE',
      subIntent: 'general_qa',
      language,
      entities
    };
  }

  // Default fallback for any general query, entity, public figure, or world knowledge
  return {
    intent: 'GENERAL_INTELLIGENCE',
    subIntent: 'world_knowledge',
    language,
    entities
  };
}

module.exports = {
  detectQueryLanguage,
  classifyIntent
};
