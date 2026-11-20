const fs = require('fs');
const path = require('path');

const KNOWLEDGE_DIR = path.resolve(__dirname, './crm-nergy');

let cachedIndex = null;
let cachedDataset = null;
let cachedMasterMemory = null;
let cachedDocuments = new Map();

class CrmKnowledgeBase {
  /**
   * Load and cache CRM Knowledge Index
   */
  static getIndex() {
    if (cachedIndex) return cachedIndex;
    try {
      const p = path.join(KNOWLEDGE_DIR, 'CRM_KNOWLEDGE_INDEX.json');
      if (fs.existsSync(p)) {
        cachedIndex = JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    } catch (e) {
      console.warn('[CrmKnowledgeBase] Failed to load index:', e.message);
    }
    return cachedIndex || {};
  }

  /**
   * Load and cache Training Dataset with QA pairs
   */
  static getTrainingDataset() {
    if (cachedDataset) return cachedDataset;
    try {
      const p = path.join(KNOWLEDGE_DIR, 'CRM_NERGY_AI_TRAINING_DATASET.json');
      if (fs.existsSync(p)) {
        cachedDataset = JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    } catch (e) {
      console.warn('[CrmKnowledgeBase] Failed to load training dataset:', e.message);
    }
    return cachedDataset || { qa_training_dataset: [] };
  }

  /**
   * Load a specific markdown knowledge file by filename
   */
  static getDocument(filename) {
    if (cachedDocuments.has(filename)) return cachedDocuments.get(filename);
    try {
      const p = path.join(KNOWLEDGE_DIR, filename);
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        cachedDocuments.set(filename, content);
        return content;
      }
    } catch (e) {
      console.warn(`[CrmKnowledgeBase] Failed to load ${filename}:`, e.message);
    }
    return '';
  }

  /**
   * Search for pre-compiled Q&A pairs matching the query
   */
  static findExactQaMatch(query) {
    const ds = this.getTrainingDataset();
    const qas = ds.qa_training_dataset || [];
    const qLower = String(query || '').toLowerCase().trim();

    for (const item of qas) {
      const promptLower = (item.prompt || '').toLowerCase().trim();
      if (promptLower === qLower || qLower.includes(promptLower) || promptLower.includes(qLower)) {
        return item.completion;
      }
    }
    return null;
  }
}

module.exports = CrmKnowledgeBase;
