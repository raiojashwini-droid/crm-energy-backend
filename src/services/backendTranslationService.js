/**
 * CRM nErgy AI — Enterprise Server-Side Neural Translation Service
 * Multi-Tier Pipeline:
 * 1. In-Memory LRU Cache
 * 2. High-speed Google Translate GTX
 * 3. Grok Neural LLM Engine Fallback
 */

const { callGrok } = require('./nativeAiEngine');

const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'hi', 'ar', 'zh', 'ja', 'pt', 'it'];

const LANG_NAMES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  hi: 'Hindi',
  ar: 'Arabic',
  zh: 'Simplified Chinese',
  ja: 'Japanese',
  pt: 'Portuguese',
  it: 'Italian',
};

const memoryCache = new Map();
const MAX_CACHE_SIZE = 5000;

function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#([0-9]{1,5});/gi, (_, numStr) => String.fromCharCode(parseInt(numStr, 10)));
}

function isPureAsciiEnglish(str) {
  if (!str || typeof str !== 'string') return false;
  return /^[\x00-\x7F]*$/.test(str);
}

async function translateText(text, targetLang, sourceLang = 'auto') {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return text;
  }

  const trimmed = text.trim();

  // If target is English and input is already pure ASCII, return as is
  if (targetLang === 'en' && isPureAsciiEnglish(trimmed)) {
    return trimmed;
  }

  const cacheKey = `${targetLang}:${trimmed}`;
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  // Tier 1: Google Translate GTX (Server-to-Server, Fast, No browser CORS)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (resp.ok) {
      const json = await resp.json();
      if (Array.isArray(json) && Array.isArray(json[0])) {
        const translated = json[0]
          .filter((item) => item && item[0])
          .map((item) => item[0])
          .join('');

        if (translated && translated.trim()) {
          const cleaned = decodeHtmlEntities(translated.trim());
          if (memoryCache.size >= MAX_CACHE_SIZE) {
            const firstKey = memoryCache.keys().next().value;
            memoryCache.delete(firstKey);
          }
          memoryCache.set(cacheKey, cleaned);
          return cleaned;
        }
      }
    }
  } catch (err) {
    // Continue to Grok fallback
  }

  // Tier 2: Grok LLM Neural Translation
  try {
    const langName = LANG_NAMES[targetLang] || targetLang;
    const prompt = `Translate the following text accurately and naturally into ${langName}. Preserve formatting, names, and tone. Output ONLY the translated text without any quotation marks, notes, explanations, or prefixes:\n\n${trimmed}`;
    const grokResult = await callGrok(
      prompt,
      `You are an expert enterprise translator specializing in natural, accurate translations into ${langName}. Respond with only the direct translation.`
    );
    if (grokResult && typeof grokResult === 'string' && grokResult.trim() && grokResult.trim() !== trimmed) {
      const cleaned = grokResult.trim().replace(/^["']|["']$/g, '');
      memoryCache.set(cacheKey, cleaned);
      return cleaned;
    }
  } catch (grokErr) {
    // Continue
  }

  return trimmed;
}

async function translateBatch(texts, targetLang, sourceLang = 'auto') {
  if (!Array.isArray(texts)) return [];
  return await Promise.all(
    texts.map((t) => (t ? translateText(t, targetLang, sourceLang) : Promise.resolve('')))
  );
}

async function translateMessages(messages, targetLang, sourceLang = 'auto') {
  const result = {};
  if (!Array.isArray(messages)) return result;

  await Promise.all(
    messages.map(async (m) => {
      if (!m || !m.id) return;
      const textToTranslate = m.originalText || m.text || '';
      if (!textToTranslate) {
        result[m.id] = '';
        return;
      }
      result[m.id] = await translateText(textToTranslate, targetLang, sourceLang);
    })
  );

  return result;
}

module.exports = {
  SUPPORTED_LANGUAGES,
  LANG_NAMES,
  translateText,
  translateBatch,
  translateMessages,
  decodeHtmlEntities,
};

