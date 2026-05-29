export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatCompletionOptions {
  temperature?: number;
  maxCompletionTokens?: number;
}

export interface ChatTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ChatCompletionResult {
  content: string;
  usage?: ChatTokenUsage;
}

/**
 * Vendor-agnostic chat completion port. Swapping Groq for another provider
 * (e.g. Anthropic) means adding a new implementation bound to CHAT_PROVIDER —
 * ChatService never sees the wire format.
 */
export interface ChatProvider {
  complete(
    messages: ChatMessage[],
    options?: ChatCompletionOptions,
  ): Promise<ChatCompletionResult>;
}

export const CHAT_PROVIDER = Symbol('CHAT_PROVIDER');
