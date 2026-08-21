const axios = require('axios');

async function synthesize(text, options = {}) {
  const languageCode = options.languageCode || 'hi-IN';
  const apiKey = process.env.SARVAM_API_KEY;

  if (!apiKey) {
    throw new Error('SARVAM_API_KEY environment variable is missing.');
  }

  const response = await axios.post('https://api.sarvam.ai/text-to-speech', {
    text: text,
    model: "bulbul:v3",
    language_code: languageCode,
    speaker: "shubh",
    output_audio_codec: "mp3"
  }, {
    headers: {
      'api-subscription-key': apiKey,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  const audios = response.data.audios;
  if (audios && audios.length > 0) {
    return { 
      audio: audios[0], 
      contentType: 'audio/mp3',
      provider: 'sarvam'
    };
  } else {
    throw new Error('No audio returned from Sarvam AI');
  }
}

module.exports = { synthesize };
