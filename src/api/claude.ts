import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY as string,
  dangerouslyAllowBrowser: true,
});

export async function callClaude(messages: any[], model: string = 'claude-3-5-sonnet-20241022', systemPrompt?: string) {
  try {
    // Separate system message from regular messages
    const systemMessage = messages.find(msg => msg.role === 'system');
    const regularMessages = messages.filter(msg => msg.role !== 'system');
    
    const requestParams: any = {
      model,
      max_tokens: 1000,
      temperature: 0.7,
      messages: regularMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    };
    
    // Add system prompt as top-level parameter if it exists
    if (systemMessage || systemPrompt) {
      requestParams.system = systemMessage?.content || systemPrompt;
    }
    
    const response = await anthropic.messages.create(requestParams);

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