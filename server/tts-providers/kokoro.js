const axios = require('axios');

async function synthesize(text, options = {}) {
  const serviceUrl = process.env.KOKORO_SERVICE_URL || 'http://localhost:8001';
  
  const response = await axios.post(`${serviceUrl}/synthesize`, {
    text: text,
    voice: options.voice || "af_heart"
  }, {
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 8000 // 8-second timeout for local Kokoro inference
  });

  if (response.data && response.data.audio) {
    return { 
      audio: response.data.audio, 
      contentType: response.data.contentType || 'audio/wav',
      provider: 'kokoro'
    };
  } else {
    throw new Error('Invalid response from Kokoro service');
  }
}

module.exports = { synthesize };
