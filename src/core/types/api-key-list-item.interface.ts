/**
 * Interface for API key list item (does not include the actual key for security)
 */
export interface ApiKeyListItem {
  id: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
