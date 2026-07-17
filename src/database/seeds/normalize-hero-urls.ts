import AppDataSource from '@config/typeorm.config';
import { Logger } from '@nestjs/common';
import { Project } from '@projects/entities/project.entity';

/**
 * Canonical host that serves the project hero assets in production.
 * Local hero images are loaded from here too, so local dev matches prod
 * exactly (same external-passthrough render path) regardless of which port
 * the dev server runs on.
 */
export const HERO_ASSET_ORIGIN = 'https://cativo.dev';

const HERO_PATH_SEGMENT = '/img/projects/heroes/';

/**
 * Normalizes a project `heroImage` value so its origin points at the canonical
 * prod asset host, keyed on the hero asset path.
 *
 * - `http://localhost:3001/img/projects/heroes/x.svg` → `https://cativo.dev/img/projects/heroes/x.svg`
 * - `https://cativo.dev/img/projects/heroes/x.svg`     → unchanged (idempotent)
 * - Any value NOT containing the hero asset path        → unchanged
 * - `null`/empty                                        → returned as-is
 *
 * This is what makes a locally hand-edited (`:3001`) DB match prod without a
 * manual DB edit: re-runnable and safe against prod data (a no-op there).
 */
export function normalizeHeroImageUrl(
  heroImage: string | null | undefined,
): string | null | undefined {
  if (!heroImage) return heroImage;
  const idx = heroImage.indexOf(HERO_PATH_SEGMENT);
  if (idx === -1) return heroImage;
  const pathAndAfter = heroImage.slice(idx);
  return `${HERO_ASSET_ORIGIN}${pathAndAfter}`;
}

/**
 * Rewrites any project whose hero URL points at a non-canonical origin
 * (e.g. a stale `localhost:3001` dev URL) to the canonical prod host.
 */
async function normalizeHeroUrls(): Promise<void> {
  const logger = new Logger('NormalizeHeroUrls');
  const dataSource = await AppDataSource.initialize();
  try {
    const repository = dataSource.getRepository(Project);
    const projects = await repository.find();
    let updated = 0;

    for (const project of projects) {
      const next = normalizeHeroImageUrl(project.heroImage);
      if (typeof next === 'string' && next !== project.heroImage) {
        await repository.update(project.id, { heroImage: next });
        logger.log(
          `Project #${project.id}: heroImage ${project.heroImage} → ${next}`,
        );
        updated += 1;
      }
    }

    logger.log(
      `Hero URL normalization complete — ${updated} of ${projects.length} project(s) updated.`,
    );
  } finally {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  normalizeHeroUrls()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
