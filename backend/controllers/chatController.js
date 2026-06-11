import { db } from '../config/firebase.js';

/**
 * @desc    Get Chat AI response
 * @route   POST /api/predict/ai-chat
 * @access  Private
 */
export const handleAIChat = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400);
      return next(new Error('Prompt is required'));
    }

    // Identify tickers from prompt
    const tickerMatch = prompt.toUpperCase().match(/\b([A-Z]{1,5})\b/g);
    let contextData = null;

    if (tickerMatch && tickerMatch.length > 0) {
      const mainTicker = tickerMatch[0];
      
      const predictionDocs = await db.collection('predictions')
        .where('symbol', '==', mainTicker)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (!predictionDocs.empty) {
        contextData = predictionDocs.docs[0].data();
      }
    }

    let aiResponse = "";

    // Simulated NLP Logic matching the frontend expectation
    if (contextData) {
      const p = contextData;
      aiResponse = `Based on the latest models, ${p.symbol} is showing a **${p.prediction}** signal with ${p.confidence}% confidence. 
      
The technical breakdown shows RSI at ${p.technicals?.rsi?.value} (${p.technicals?.rsi?.status}) and momentum is ${p.technicals?.momentum?.status}. 

**AI Reasoning:** ${p.reasoning}`;
    } else if (prompt.toLowerCase().includes('market')) {
      aiResponse = `The broader market currently shows mixed signals. Growth sectors like Technology are maintaining bullish momentum, whereas energy and defensive sectors are seeing some consolidation. The AI models are highly confident in upcoming volatility expansions.`;
    } else {
      aiResponse = `I'm analyzing your request regarding "${prompt}". Could you specify a particular stock ticker (like AAPL or NVDA) so I can pull the latest quantitative predictions?`;
    }

    // Log chat interaction
    await db.collection('activityLogs').add({
      userId: req.user.id,
      action: 'AI_CHAT_QUERY',
      details: `Queried AI: ${prompt.substring(0, 50)}...`,
      createdAt: new Date().toISOString()
    });

    // Simulate natural delay for processing
    setTimeout(() => {
      res.json({
        response: aiResponse,
        contextUsed: contextData ? contextData.symbol : null
      });
    }, 1500);

  } catch (error) {
    res.status(500);
    next(error);
  }
};
