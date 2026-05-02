import { Repository } from 'typeorm';
import { PaginationUtil } from '@core/utils/pagination.util';

/**
 * Builds a chain-able query builder mock that captures every andWhere call
 * so tests can assert on the SQL fragments PaginationUtil emits.
 */
function makeQueryBuilderMock(): {
  andWhereCalls: Array<{ sql: string; params?: Record<string, unknown> }>;
  qb: Record<string, jest.Mock>;
} {
  const andWhereCalls: Array<{
    sql: string;
    params?: Record<string, unknown>;
  }> = [];
  const qb: Record<string, jest.Mock> = {
    andWhere: jest.fn((sql: string, params?: Record<string, unknown>) => {
      andWhereCalls.push({ sql, params });
      return qb;
    }),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  };
  return { andWhereCalls, qb };
}

function makeRepoMock(opts: {
  qb: Record<string, jest.Mock>;
  withDeleteDateColumn: boolean;
}): Repository<unknown> {
  return {
    createQueryBuilder: jest.fn(() => opts.qb),
    metadata: {
      deleteDateColumn: opts.withDeleteDateColumn
        ? { propertyName: 'deletedAt' }
        : undefined,
    },
  } as unknown as Repository<unknown>;
}

describe('PaginationUtil', () => {
  describe('soft-delete filtering', () => {
    it('excludes soft-deleted rows when the entity has a DeleteDateColumn', async () => {
      const { andWhereCalls, qb } = makeQueryBuilderMock();
      const repo = makeRepoMock({ qb, withDeleteDateColumn: true });

      await PaginationUtil.paginate(repo, {
        page: 1,
        per_page: 10,
        alias: 'projects',
      });

      // The util must add a guard against soft-deleted rows because
      // TypeORM's QueryBuilder (unlike repository.find) does not apply it
      // automatically. Without this guard, soft-deleted records leak into
      // every paginated list endpoint.
      expect(andWhereCalls).toEqual(
        expect.arrayContaining([
          { sql: 'projects.deletedAt IS NULL', params: undefined },
        ]),
      );
    });

    it('does not add the soft-delete guard when the entity has no DeleteDateColumn', async () => {
      const { andWhereCalls, qb } = makeQueryBuilderMock();
      const repo = makeRepoMock({ qb, withDeleteDateColumn: false });

      await PaginationUtil.paginate(repo, {
        page: 1,
        per_page: 10,
        alias: 'thing',
      });

      const softDeleteGuards = andWhereCalls.filter((c) =>
        c.sql.includes('deletedAt IS NULL'),
      );
      expect(softDeleteGuards).toHaveLength(0);
    });

    it('uses the entity-defined property name (not a hardcoded "deletedAt")', async () => {
      const { andWhereCalls, qb } = makeQueryBuilderMock();
      const repo = {
        createQueryBuilder: jest.fn(() => qb),
        metadata: { deleteDateColumn: { propertyName: 'removedAt' } },
      } as unknown as Repository<unknown>;

      await PaginationUtil.paginate(repo, {
        page: 1,
        per_page: 10,
        alias: 'projects',
      });

      expect(andWhereCalls).toEqual(
        expect.arrayContaining([
          { sql: 'projects.removedAt IS NULL', params: undefined },
        ]),
      );
    });
  });
});
