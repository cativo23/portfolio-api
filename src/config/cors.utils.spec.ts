import { buildCorsAllowlist, isOriginAllowed } from './cors.utils';
import type { AppConfig } from './configuration.types';

function makeConfig(nodeEnv: string, corsOrigins: string[] = []): AppConfig {
  return { nodeEnv, corsOrigins, port: 3000 };
}

describe('buildCorsAllowlist', () => {
  it('returns only configured origins in production', () => {
    const cfg = makeConfig('production', ['https://mysite.com']);
    expect(buildCorsAllowlist(cfg)).toEqual(['https://mysite.com']);
  });

  it('appends localhost dev-server ports in development', () => {
    const cfg = makeConfig('development', ['https://mysite.com']);
    const list = buildCorsAllowlist(cfg);
    expect(list).toContain('https://mysite.com');
    expect(list).toContain('http://localhost:3000');
    expect(list).toContain('http://localhost:4200');
    expect(list).toContain('http://localhost:5173');
    expect(list).toContain('http://localhost:5174');
    expect(list).toContain('http://localhost:8080');
  });

  it('deduplicates when configured origin overlaps with a dev port', () => {
    const cfg = makeConfig('development', ['http://localhost:3000']);
    const list = buildCorsAllowlist(cfg);
    expect(list.filter((o) => o === 'http://localhost:3000')).toHaveLength(1);
  });

  it('returns empty list in production when no origins are configured', () => {
    const cfg = makeConfig('production', []);
    expect(buildCorsAllowlist(cfg)).toEqual([]);
  });

  it('does not add localhost ports in test or staging environments', () => {
    const cfg = makeConfig('test', ['https://staging.mysite.com']);
    const list = buildCorsAllowlist(cfg);
    expect(list).toEqual(['https://staging.mysite.com']);
    expect(list).not.toContain('http://localhost:3000');
  });
});

describe('isOriginAllowed', () => {
  const allowlist = ['https://mysite.com', 'https://admin.mysite.com'];

  it('returns true for a listed origin', () => {
    expect(isOriginAllowed('https://mysite.com', allowlist)).toBe(true);
  });

  it('returns false for an unlisted origin', () => {
    expect(isOriginAllowed('https://evil.com', allowlist)).toBe(false);
  });

  it('returns true when origin is undefined (non-browser / curl calls)', () => {
    expect(isOriginAllowed(undefined, allowlist)).toBe(true);
  });

  it('is case-sensitive and does not match trailing slashes', () => {
    expect(isOriginAllowed('https://mysite.com/', allowlist)).toBe(false);
    expect(isOriginAllowed('HTTPS://mysite.com', allowlist)).toBe(false);
  });
});
