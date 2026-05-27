const Post = require('../models/Post');
const { createObjectCsvStringifier } = require('csv-writer');
const OpenAI = require('openai');

// Simple sentiment and category helpers for beginners
const positiveWords = ['good', 'great', 'thanks', 'happy', 'success', 'approved'];
const negativeWords = ['delay', 'problem', 'worse', 'angry', 'cancel', 'error', 'scam'];

function analyzeSentiment(text) {
  const t = (text || '').toLowerCase();
  let score = 0;
  positiveWords.forEach(w => { if (t.includes(w)) score++; });
  negativeWords.forEach(w => { if (t.includes(w)) score--; });
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

function categorize(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('renew') || t.includes('renewal')) return 'Renewal';
  if (t.includes('visa')) return 'Visa';
  if (t.includes('tatkal')) return 'Tatkal';
  if (t.includes('appointment')) return 'Appointments';
  if (t.includes('scam') || t.includes('fraud')) return 'Scam/Fraud';
  if (t.includes('travel')) return 'Travel Issues';
  return 'News';
}

let openAIAvailable = true;

// Generate a short summary for a post.
// If an OpenAI key is configured and quota is available, attempt the OpenAI call.
// Otherwise, return a local fallback summary based on the first 120 characters.
async function generateSummary(text) {
  const key = process.env.OPENAI_API_KEY;
  const short = (text || '').slice(0, 120);
  if (!text) return '';
  if (!key || !openAIAvailable) {
    // Mock summary: first 120 chars
    return short + (text.length > 120 ? '...' : '');
  }
  try {
    const client = new OpenAI({ apiKey: key });
    const prompt = `Summarize in one short sentence (<=20 words): ${text}`;
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 60
    });
    const out = resp.choices?.[0]?.message?.content?.trim();
    return out || short;
  } catch (err) {
    if (err?.response?.status === 429) {
      openAIAvailable = false;
      logOpenAIQuotaError();
    } else {
      console.warn('OpenAI error, falling back to mock', err.message);
    }
    return short + (text.length > 120 ? '...' : '');
  }
}

let openAIQuotaLogged = false;

function logOpenAIQuotaError() {
  if (!openAIQuotaLogged) {
    openAIQuotaLogged = true;
    console.warn('OpenAI quota exceeded; falling back to mock summaries.');
  }
}

// Remove gibberish: very short content
function isGibberish(text) {
  if (!text) return true;
  if (text.split(' ').length < 3) return true;
  return false;
}

// GET /api/posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ timestamp: -1 }).limit(200);
    // Filter gibberish and attach summary/category/sentiment if missing.
  // Process posts sequentially rather than in parallel so OpenAI quota errors
  // can switch the service to fallback mode for the remaining items.
    const enhanced = [];
    for (const post of posts) {
      if (isGibberish(post.content)) continue;
      if (!post.summary) post.summary = await generateSummary(post.content);
      if (!post.sentiment) post.sentiment = analyzeSentiment(post.content);
      if (!post.category) post.category = categorize(post.content);
      enhanced.push(post);
    }
    res.json(enhanced);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/posts/search?q=keyword
exports.searchPosts = async (req, res) => {
  try {
    const q = req.query.q || '';
    const regex = new RegExp(q, 'i');
    const posts = await Post.find({ $or: [{ title: regex }, { content: regex }] }).sort({ timestamp: -1 }).limit(200);
    res.json(posts.filter(p => !isGibberish(p.content)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/posts/filter?platform=reddit&category=Visa&sentiment=positive
exports.filterPosts = async (req, res) => {
  try {
    const { platform, category, sentiment } = req.query;
    const query = {};
    if (platform) query.platform = platform;

    const posts = await Post.find(query).sort({ timestamp: -1 }).limit(500);
    const enhanced = posts
      .filter(p => !isGibberish(p.content))
      .map(p => {
        const post = p.toObject();
        if (!post.sentiment) post.sentiment = analyzeSentiment(post.content);
        if (!post.category) post.category = categorize(post.content);
        return post;
      });

    const filtered = enhanced.filter(p => {
      if (category && p.category?.toLowerCase() !== category.toLowerCase()) return false;
      if (sentiment && p.sentiment?.toLowerCase() !== sentiment.toLowerCase()) return false;
      return true;
    });

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Local English-to-Hindi translator used when OpenAI is disabled or not required.
// First apply known phrase replacements, then translate remaining words token by token.
function translateToHindi(text) {
  if (!text) return '';

  const phraseMap = [
    [/be careful/gi, 'सावधान रहें'],
    [/tatkal slots were full/gi, 'टैटकाल स्लॉट्स भरे हुए थे'],
    [/tatkal slots were/gi, 'टैटकाल स्लॉट्स थे'],
    [/tatkal slots/gi, 'टैटकाल स्लॉट्स'],
    [/payment failed/gi, 'भुगतान विफल हो गया'],
    [/where agents ask के लिए extra fees/gi, 'जहां एजेंट अतिरिक्त शुल्क मांगते हैं'],
    [/there है a new धोखाधड़ी/gi, 'वहाँ एक नई धोखाधड़ी है'],
    [/do not share otps/gi, 'OTP साझा न करें'],
    [/do not share otp/gi, 'OTP साझा न करें'],
    [/full/gi, 'भरा हुआ'],
    [/now worried about/gi, 'अब के बारे में चिंतित हूँ'],
    [/next month/gi, 'अगले महीने'],
    [/appointment was easy/gi, 'अपॉइंटमेंट आसान था'],
    [/thanks to the e-service/gi, 'ई-सेवा के लिए धन्यवाद'],
    [/I applied for passport renewal yesterday/gi, 'मैंने कल पासपोर्ट नवीकरण के लिए आवेदन किया']
  ];

  let translated = text;
  phraseMap.forEach(([pattern, replacement]) => {
    translated = translated.replace(pattern, replacement);
  });

  const dictionary = {
    'hello': 'नमस्ते',
    'hi': 'हाय',
    'thank': 'धन्यवाद',
    'thanks': 'धन्यवाद',
    'please': 'कृपया',
    'good': 'अच्छा',
    'great': 'बहुत अच्छा',
    'bad': 'बुरा',
    'problem': 'समस्या',
    'issue': 'मुद्दा',
    'visa': 'वीज़ा',
    'renewal': 'नवीकरण',
    'travel': 'यात्रा',
    'scam': 'धोखाधड़ी',
    'fraud': 'धोखाधड़ी',
    'news': 'समाचार',
    'help': 'मदद',
    'need': 'ज़रूरत',
    'want': 'चाहते हैं',
    'service': 'सेवा',
    'delay': 'देरी',
    'ticket': 'टिकट',
    'passport': 'पासपोर्ट',
    'application': 'आवेदन',
    'submitted': 'जमा किया गया',
    'approved': 'मंजूर',
    'rejected': 'अस्वीकृत',
    'is': 'है',
    'was': 'था',
    'were': 'थे',
    'easy': 'आसान',
    'yesterday': 'कल',
    'applied': 'आवेदन किया',
    'for': 'के लिए',
    'to': 'को',
    'be': 'होना',
    'careful': 'सावधान',
    'there': 'वहाँ',
    'a': 'एक',
    'new': 'नई',
    'where': 'जहां',
    'agents': 'एजेंट',
    'ask': 'मांगते',
    'extra': 'अतिरिक्त',
    'fees': 'शुल्क',
    'do': 'करें',
    'not': 'न',
    'share': 'साझा',
    'otps': 'OTP',
    'otp': 'OTP',
    'now': 'अब',
    'worried': 'चिंतित',
    'about': 'के बारे में',
    'next': 'अगला',
    'month': 'महीना',
    'payment': 'भुगतान',
    'failed': 'विफल',
    'slots': 'स्लॉट्स',
    'tatkal': 'टैटकाल',
    'appointment': 'अपॉइंटमेंट',
    'service': 'सेवा',
    'full': 'पूर्ण',
    'and': 'और',
    'were': 'थे',
    'is': 'है',
    'i': 'मैं',
    'am': 'हूँ',
    'was': 'था',
    'are': 'हैं',
    'in': 'में',
    'on': 'पर',
    'with': 'के साथ',
    'about': 'के बारे में',
    'my': 'मेरा',
    'your': 'आपका'
  };

  translated = translated.split(/(\s+|[.,!?;:"'()]+)/).map(token => {
    const lower = token.toLowerCase();
    if (!lower.match(/^\w+$/)) return token;
    return dictionary[lower] || token;
  }).join('');

  translated = translated.replace(/\b__\b/g, '').replace(/\s+([.,!?;:])/g, '$1').replace(/\s+/g, ' ').trim();
  return translated;
}

// POST /api/posts/translate  { id, to }
exports.translatePost = async (req, res) => {
  try {
    const { id, to = 'hi' } = req.body;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    let translated;
    const targetLang = (to || 'hi').toLowerCase();

    if (targetLang === 'hi') {
      translated = translateToHindi(post.content);
    } else {
      translated = `${post.content} (translated to ${targetLang} - mock)`;
    }

    post.translatedText = translated;
    await post.save();
    res.json({ translatedText: translated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/export/csv
exports.exportCSV = async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ timestamp: -1 }).limit(1000);
    const header = Object.keys(Post.schema.paths).filter(k => k !== '__v' && k !== '_id');
    const csvStringifier = createObjectCsvStringifier({ header: header.map(h => ({ id: h, title: h })) });
    const records = posts.map(p => {
      const obj = {};
      header.forEach(h => obj[h] = p[h] || '');
      return obj;
    });
    const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
    res.setHeader('Content-disposition', 'attachment; filename=posts.csv');
    res.set('Content-Type', 'text/csv');
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
