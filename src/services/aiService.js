/**
 * CRM nErgy AI — Universal AI Service
 * Supports Local Ollama (Qwen3:4B with think:false for ultra-fast CPU inference)
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:4b';

async function generateAiContent({ prompt, systemInstruction = '', model }) {
  const chosenModel = model || OLLAMA_MODEL;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000); // 3 minutes safety timeout

    console.log(`[AiService] Fast CPU generation with ${chosenModel} (think: false, 8 threads)...`);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: chosenModel,
        prompt: prompt,
        system: systemInstruction || "You are Bestie, an executive AI operating partner for CRM nErgy. Answer directly, concisely, and professionally using clear bold bullet points.",
        stream: false,
        think: false, // Disables the heavy Chain-of-Thought thinking loop on CPU
        options: {
          temperature: 0.1,
          num_predict: 200, // Fast executive answer length
          num_thread: 8     // Utilize all 8 CPU cores
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      let rawText = data.response || data.message?.content || '';
      const cleanText = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

      if (cleanText || rawText) {
        return {
          success: true,
          engine: 'ollama',
          model: chosenModel,
          text: cleanText || rawText.trim(),
          timestamp: new Date().toISOString(),
        };
      }
    } else {
      const errText = await response.text();
      console.warn(`[AiService] Ollama HTTP ${response.status}: ${errText}`);
    }
  } catch (err) {
    console.warn(`[AiService] Ollama error:`, err.message);
  }

  throw new Error(`AI generation timed out or failed on CPU.`);
}

async function checkAiStatus() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    const data = await res.json();
    return {
      status: 'online',
      primaryEngine: 'Ollama (Local Server AI)',
      activeModel: OLLAMA_MODEL,
      installedModels: (data.models || []).map(m => m.name)
    };
  } catch (e) {
    return { status: 'offline', error: e.message };
  }
}

module.exports = { generateAiContent, checkAiStatus };
