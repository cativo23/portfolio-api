/**
 * Domain-level error for any chat provider failure. Deliberately carries no
 * vendor payload so upstream layers can surface a generic message without
 * leaking provider internals (status bodies may echo auth context).
 */
export class ChatProviderError extends Error {
  constructor(message = 'Chat provider request failed') {
    super(message);
    this.name = 'ChatProviderError';
  }
}
