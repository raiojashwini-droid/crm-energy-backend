const aiService = require('../services/aiService');

/**
 * Handle AI Generation Requests (Bestie Copilot, 15 Studios, AI Marketing)
 * POST /api/ai/generate
 */
async function generateContent(req, res) {
  try {
    const { prompt, systemInstruction, model } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required and must be a string.',
      });
    }

    const result = await aiService.generateAiContent({
      prompt,
      systemInstruction,
      model,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('[AiController Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'AI generation failed.',
    });
  }
}

/**
 * Get AI Health and Status
 * GET /api/ai/status
 */
async function getStatus(req, res) {
  try {
    const status = await aiService.checkAiStatus();
    return res.status(200).json({
      success: true,
      ...status,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  generateContent,
  getStatus,
};

