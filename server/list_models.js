require('dotenv').config();
const axios = require('axios');
async function list() {
  try {
    const res = await axios.get('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
    });
    console.log(res.data.data.map(m => m.id).join(', '));
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
list();
