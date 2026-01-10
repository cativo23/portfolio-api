import { Repository, SelectQueryBuilder } from 'typeorm';

/**
 * Options for pagination utility
 */
export interface PaginationOptions {
  /** Page number for pagination */
  page: number;
  /** Number of items per page */
  per_page: number;
  /** Optional search term to filter entities */
  search?: string;
  /** Fields to search in when search term is provided */
  searchFields?: string[];
  /** Additional filters to apply */
  filters?: Record<string, any>;
  /** Custom ordering configuration */
  orderBy?: {
    field: string;
    direction: 'ASC' | 'DESC';
  };
  /** Query builder alias (e.g., 'projects', 'contacts') */
  alias?: string;
}

/**
 * Result returned by pagination utility
 */
export interface PaginationResult<TEntity> {
  /** Paginated items */
  items: TEntity[];
  /** Total count of items matching the query */
  total: number;
  /** Current page number */
  page: number;
  /** Items per page */
  per_page: number;
}

/**
 * Utility class for common pagination, filtering, and query building logic
 *
 * This utility eliminates duplication of pagination logic across services.
 * It handles search, filtering, ordering, and pagination in a reusable way.
 */
export class PaginationUtil {
  /**
   * Paginates and filters entities using TypeORM query builder
   *
   * @param repository - TypeORM repository to query
   * @param options - Pagination, search, and filtering options
   * @returns Promise resolving to paginated results with metadata
   */
  static async paginate<TEntity>(
    repository: Repository<TEntity>,
    options: PaginationOptions,
  ): Promise<PaginationResult<TEntity>> {
    const {
      page,
      per_page,
      search,
      searchFields = [],
      filters = {},
      orderBy,
      alias = 'entity',
    } = options;

    const query = repository.createQueryBuilder(alias);

    // Apply search if provided
    if (search && searchFields.length > 0) {
      const searchConditions = searchFields
        .map((field) => `${alias}.${field} LIKE :search`)
        .join(' OR ');
      query.andWhere(`(${searchConditions})`, { search: `%${search}%` });
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value !== 'undefined') {
        query.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
      }
    });

    // Apply ordering
    const orderField = orderBy?.field || 'createdAt';
    const orderDirection = orderBy?.direction || 'DESC';
    query.orderBy(`${alias}.${orderField}`, orderDirection);

    // Apply pagination
    query.skip((page - 1) * per_page).take(per_page);

    // Execute query and get results with total count
    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      per_page,
    };
  }
}
