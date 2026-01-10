import { Request } from 'express';
import { User } from '@users/entities/user.entity';

/**
 * Extended Express Request interface for authenticated requests
 *
 * This interface extends the base Express Request to include the user property
 * that is set by authentication guards (JWT, API Key, etc.).
 */
export interface AuthenticatedRequest extends Request {
  /**
   * Authenticated user object set by authentication guards
   */
  user: User;
}
