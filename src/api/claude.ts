import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY as string,
});

export async function callClaude(messages: any[], model: string = 'claude-3-5-sonnet-20241022') {
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1000,
      temperature: 0.7,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    });

    // Extract text content from response blocks safely
    const blocks = Array.isArray(response.content) ? response.content : [];
    const content = blocks
      .map((block: any) => (block && block.type === 'text' && typeof block.text === 'string') ? block.text : '')
      .filter(Boolean)
      .join('\n')
      .trim();

    return { content, usage: response.usage };
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to get response from Claude');
  }
} 