const fs = require('fs');
const path = require('path');

const VECTOR_FILE = path.resolve(__dirname, '../data/crm_nergy_vectors.json');

let cachedChunks = null;

class CrmRagEngine {
  /**
   * Load vector chunks from persistent file
   */
  static getChunks() {
    if (cachedChunks) return cachedChunks;
    try {
      if (fs.existsSync(VECTOR_FILE)) {
        cachedChunks = JSON.parse(fs.readFileSync(VECTOR_FILE, 'utf8'));
      }
    } catch (e) {
      console.warn('[CrmRagEngine] Error reading vector file:', e.message);
    }
    return cachedChunks || [];
  }

  /**
   * Tokenize text into normalized alphanumeric keywords
   */
  static tokenize(text) {
    if (!text) return [];
    return String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s_-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1);
  }

  /**
   * Hybrid keyword, header, and semantic search against knowledge chunks
   */
  static search(query, options = {}) {
    const { topK = 4, scoreThreshold = 0.25 } = options;
    const cleanQuery = String(query || '').trim();
    if (!cleanQuery) {
      return { chunks: [], hasRelevantKnowledge: false, topScore: 0, sources: [] };
    }

    const chunks = this.getChunks();
    if (chunks.length === 0) {
      return { chunks: [], hasRelevantKnowledge: false, topScore: 0, sources: [] };
    }

    const queryTokens = this.tokenize(cleanQuery);
    const queryLower = cleanQuery.toLowerCase();

    // Query expansion synonyms for CRM concepts
    const synonymExpansions = [];
    if (/lead/i.test(queryLower)) synonymExpansions.push('lead', 'prospect', 'inbound', 'convert', 'scoring');
    if (/deal|pipeline/i.test(queryLower)) synonymExpansions.push('pipeline', 'deal', 'kanban', 'stage', 'revenue');
    if (/task/i.test(queryLower)) synonymExpansions.push('task', 'activity', 'agenda', 'todo');
    if (/ebox|zbox/i.test(queryLower)) synonymExpansions.push('ebox', 'zbox', 'encryption', 'swmtp', 'vault');
    if (/erp|inventory/i.test(queryLower)) synonymExpansions.push('inventory', 'warehouse', 'sku', 'threshold', 'purchaseorder');
    if (/hr|recruiting/i.test(queryLower)) synonymExpansions.push('hr', 'recruiting', 'ats', 'candidate', 'interview', 'payroll');
    if (/module|feature|menu/i.test(queryLower)) synonymExpansions.push('module', 'navigation', 'route', 'menu', 'sidebar');
    if (/studio|voice/i.test(queryLower)) synonymExpansions.push('studio', 'voice', 'superhouse', 'video');
    if (/role|permission|rbac/i.test(queryLower)) synonymExpansions.push('role', 'rbac', 'permission', 'persona', 'business_owner');

    const allSearchTokens = Array.from(new Set([...queryTokens, ...synonymExpansions]));

    const scored = chunks.map((chunk) => {
      const content = chunk.content || '';
      const contentLower = content.toLowerCase();
      const meta = chunk.metadata || {};
      const section = (meta.section_header || '').toLowerCase();
      const docName = (meta.document_name || '').toLowerCase();
      const moduleName = (meta.module_name || '').toLowerCase();

      let score = 0;

      // Exact phrase match bonus
      if (contentLower.includes(queryLower)) {
        score += 0.50;
      }

      // Section header exact or partial match bonus
      if (section && (section.includes(queryLower) || queryLower.includes(section))) {
        score += 0.40;
      }

      // Module name match bonus
      if (moduleName && queryLower.includes(moduleName)) {
        score += 0.25;
      }

      // Keyword token overlap scoring (BM25 approximation)
      let tokenMatches = 0;
      queryTokens.forEach((qt) => {
        if (contentLower.includes(qt)) {
          tokenMatches++;
          // Extra boost if token appears in header or title
          if (section.includes(qt)) score += 0.10;
        }
      });

      if (queryTokens.length > 0) {
        score += (tokenMatches / queryTokens.length) * 0.45;
      }

      // Synonym token support
      synonymExpansions.forEach((st) => {
        if (contentLower.includes(st)) {
          score += 0.05;
        }
      });

      return {
        id: chunk.id,
        score: Math.min(1.0, score),
        content: chunk.content,
        metadata: chunk.metadata,
        sectionHeader: meta.section_header || 'CRM Documentation',
        source: meta.document_name || 'CRM_MASTER_KNOWLEDGE_BASE.md'
      };
    });

    // Sort by score descending and filter by threshold
    const filtered = scored
      .filter((item) => item.score >= scoreThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    const topScore = filtered.length > 0 ? filtered[0].score : 0;
    const sources = Array.from(new Set(filtered.map((f) => f.source)));

    return {
      chunks: filtered,
      hasRelevantKnowledge: filtered.length > 0 && topScore >= scoreThreshold,
      topScore,
      sources,
      query: cleanQuery
    };
  }
}

module.exports = CrmRagEngine;
