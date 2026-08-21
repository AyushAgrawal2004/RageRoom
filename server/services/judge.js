const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const JUDGE_SYSTEM_PROMPT = `You are an expert customer service evaluator.
Your job is to read a transcript between a trainee (support agent) and a difficult AI customer, and evaluate the trainee's performance.

Rate the trainee out of 10 in the following categories:
- professionalism: How professionally did they communicate?
- deEscalation: How well did they calm the angry customer?
- problemSolving: How effectively did they resolve the issue?
- empathy: Did they show understanding and warmth?

Also provide:
- overallScore: An overall grade out of 100.
- feedback: A 2-3 sentence constructive feedback paragraph.

Output ONLY JSON in this exact structure:
{
  "professionalism": number,
  "deEscalation": number,
  "problemSolving": number,
  "empathy": number,
  "overallScore": number,
  "feedback": "string"
}`;

async function generateReportCard(transcript) {
  try {
    const response = await openai.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: JUDGE_SYSTEM_PROMPT },
        { role: 'user', content: `TRANSCRIPT:\n\n${transcript}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return parsed;
  } catch (error) {
    console.error('Judge evaluation failed:', error);
    // Fallback report card in case of API failure
    return {
      professionalism: 0,
      deEscalation: 0,
      problemSolving: 0,
      empathy: 0,
      overallScore: 0,
      feedback: "Failed to generate report card due to API error."
    };
  }
}

module.exports = { generateReportCard };
