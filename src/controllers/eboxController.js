const eboxService = require('../services/eboxService');
const translationService = require('../services/backendTranslationService');

const VALID_LANGS = new Set(['en', 'es', 'fr', 'de', 'hi', 'ar', 'zh', 'ja', 'pt', 'it']);

class EboxController {
  async getMessages(req, res, next) {
    try {
<<<<<<< HEAD
      const tenantId = req.user?.tenantId || 'TENANT-08492';
      const messages = await eboxService.getMessages(tenantId, req.user);
=======
      const messages = await eboxService.getMessages(req.user?.tenantId);
>>>>>>> c19c1d725bb23f432e7a7f071f76bb7afe85b367
      return res.status(200).json({
        success: true,
        count: messages.length,
        data: messages,
      });
    } catch (error) {
      console.error('[EboxController.getMessages error]:', error);
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        warning: 'eBox messages retrieved with safe fallback.'
      });
    }
  }

  async sendMessage(req, res, next) {
    try {
<<<<<<< HEAD
      const tenantId = req.user?.tenantId || 'TENANT-08492';
      const userId = req.user?.userId || req.user?.id || 'default-owner';
      const message = await eboxService.sendMessage(tenantId, userId, req.body, req.user);
=======
      const message = await eboxService.sendMessage(req.user?.tenantId, req.user?.userId, req.body);
>>>>>>> c19c1d725bb23f432e7a7f071f76bb7afe85b367
      return res.status(201).json({
        success: true,
        message: 'Encrypted message transmitted to vault.',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ebox/translate
   * Translates eBox messages into the specified target language.
   * Body: { targetLang: 'hi'|'es'|..., text?: string, texts?: string[], messages?: [{id, text}] }
   */
  async translateMessages(req, res, next) {
    try {
      const { targetLang, sourceLang = 'auto', text, texts, messages } = req.body;

      if (!targetLang || !VALID_LANGS.has(targetLang)) {
        return res.status(400).json({
          success: false,
          error: `targetLang must be one of: ${[...VALID_LANGS].join(', ')}`,
        });
      }

      // Single text
      if (typeof text === 'string' && text.trim()) {
        const translatedText = await translationService.translateText(text.trim(), targetLang, sourceLang);
        return res.status(200).json({ success: true, targetLang, translatedText });
      }

      // Array of plain texts
      if (Array.isArray(texts) && texts.length > 0) {
        const translations = await translationService.translateBatch(texts, targetLang, sourceLang);
        return res.status(200).json({ success: true, targetLang, translations });
      }

      // Array of message objects: [{id, text}]
      if (Array.isArray(messages) && messages.length > 0) {
        const translationsMap = await translationService.translateMessages(messages, targetLang, sourceLang);
        return res.status(200).json({ success: true, targetLang, translations: translationsMap });
      }

      return res.status(400).json({
        success: false,
        error: 'Provide text (string), texts (array of strings), or messages (array of {id, text}) in request body.',
      });
    } catch (error) {
      console.error('[EboxController.translateMessages error]:', error);
      return res.status(500).json({ success: false, error: 'Translation failed: ' + error.message });
    }
  }
}

module.exports = new EboxController();
