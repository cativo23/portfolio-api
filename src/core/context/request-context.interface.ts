/**
 * Request context interface for type-safe access to request-scoped data
 *
 * This interface defines the structure of data stored in the request context
 * using AsyncLocalStorage (via nestjs-cls).
 *
 * Implementation choice: We use a typed interface instead of a generic object
 * because:
 * 1. Type safety - prevents typos and ensures correct usage
 * 2. IDE autocomplete - better developer experience
 * 3. Documentation - clearly shows what data is available
 * 4. Maintainability - changes to context structure are explicit
 */
export interface RequestContext {
  /**
   * Unique request identifier for tracking and debugging
   */
  requestId: string;

  /**
   * Request path
   */
  path: string;

  /**
   * Request method (GET, POST, etc.)
   */
  method: string;

  /**
   * Client IP address
   */
  ip: string;

  /**
   * Request timestamp (ISO 8601)
   */
  timestamp: string;
}
