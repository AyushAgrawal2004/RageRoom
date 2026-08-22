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

CRITICAL RULES:
1. Short Sessions: If the transcript is very short, do not penalize the agent for failing to completely solve the problem. Grade them ONLY on the quality, professionalism, and empathy of the few messages they did manage to send.
2. Emotional Progress: Use the Before & After emotional metrics provided to objectively see if they made progress.

Output ONLY JSON in this exact structure:
{
  "professionalism": number,
  "deEscalation": number,
  "problemSolving": number,
  "empathy": number,
  "feedback": "A 2-3 sentence constructive feedback paragraph referencing their specific actions and the emotional outcome."
}`;

async function generateReportCard(transcript, startingFactors, finalFactors, turnCount) {
  try {
    const contextStr = `TRANSCRIPT (${turnCount} agent turns):\n\n${transcript}\n\nMETRICS:\nStarting State: ${JSON.stringify(startingFactors)}\nFinal State: ${JSON.stringify(finalFactors)}`;
    
    const response = await openai.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: JUDGE_SYSTEM_PROMPT },
        { role: 'user', content: contextStr }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return parsed;
  } catch (error) {
    console.error('Judge evaluation failed:', error);
    return {
      professionalism: 0,
      deEscalation: 0,
      problemSolving: 0,
      empathy: 0,
      feedback: "Failed to generate report card due to API error."
    };
  }
}

module.exports = { generateReportCard };
