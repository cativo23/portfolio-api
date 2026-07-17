import {
  normalizeHeroImageUrl,
  HERO_ASSET_ORIGIN,
} from './normalize-hero-urls';

describe('normalizeHeroImageUrl', () => {
  it('rewrites a stale localhost:3001 dev origin to the canonical prod host', () => {
    expect(
      normalizeHeroImageUrl(
        'http://localhost:3001/img/projects/heroes/portfolio.svg',
      ),
    ).toBe(`${HERO_ASSET_ORIGIN}/img/projects/heroes/portfolio.svg`);
  });

  it('rewrites any other dev port (e.g. 3002) the same way', () => {
    expect(
      normalizeHeroImageUrl(
        'http://localhost:3002/img/projects/heroes/nightwire.svg',
      ),
    ).toBe(`${HERO_ASSET_ORIGIN}/img/projects/heroes/nightwire.svg`);
  });

  it('is idempotent when the value already points at the canonical host', () => {
    const canonical = `${HERO_ASSET_ORIGIN}/img/projects/heroes/lumira.svg`;
    expect(normalizeHeroImageUrl(canonical)).toBe(canonical);
  });

  it('leaves unrelated URLs (no hero asset path) untouched', () => {
    expect(normalizeHeroImageUrl('https://cativo.dev/og-image.png')).toBe(
      'https://cativo.dev/og-image.png',
    );
    expect(normalizeHeroImageUrl('https://blog.example.com/hero.png')).toBe(
      'https://blog.example.com/hero.png',
    );
  });

  it('returns null/undefined/empty unchanged', () => {
    expect(normalizeHeroImageUrl(null)).toBeNull();
    expect(normalizeHeroImageUrl(undefined)).toBeUndefined();
    expect(normalizeHeroImageUrl('')).toBe('');
  });
});
