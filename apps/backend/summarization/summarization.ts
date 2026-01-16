import { OpenRouter } from '@openrouter/sdk';
import * as fs from 'fs'
const openRouter = new OpenRouter({ apiKey: "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" });

async function summarization(prompt: string) {
    const templateContent = fs.readFileSync('D:/super30/meeting-bot/apps/backend/summarization/template.txt', 'utf-8');
    console.log(templateContent)
  const response = await openRouter.chat.send({
    model: 'openai/gpt-4o',
    messages: [{role: 'assistant', content: templateContent}, { role: 'user', content: prompt }],
    maxTokens: 400
  });
  console.log("response", response.choices[0]!.message.content)
  return response.choices[0]!.message.content;
}
export { summarization }
