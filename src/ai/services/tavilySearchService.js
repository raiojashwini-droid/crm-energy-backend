/**
 * Tavily Search Service for General World Knowledge & Real-Time Intelligence
 */

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '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';

async function searchTavily(query) {
  if (!query || !query.trim()) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query.trim(),
        search_depth: 'basic',
        max_results: 3
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[Tavily] Search failed with status ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.warn('[Tavily] Search invocation warning:', err.message);
    return null;
  }
}

module.exports = {
  searchTavily
};
