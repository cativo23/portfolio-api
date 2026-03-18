import * as express from 'express';
import * as request from 'supertest';
import helmet from 'helmet';

/**
 * Verifies that Helmet security headers are correctly configured
 * with CSP directives that allow Swagger UI.
 *
 * Uses a standalone Express app to test Helmet in isolation,
 * without needing the full NestJS app or database.
 */
describe('Helmet Security Headers (e2e)', () => {
  let app: express.Express;

  beforeAll(() => {
    app = (express as any)();
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: [`'self'`],
            styleSrc: [`'self'`, `'unsafe-inline'`],
            imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
            scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          },
        },
      }),
    );
    app.get('/test', (_req: any, res: any) => {
      res.json({ ok: true });
    });
  });

  it('should include X-Content-Type-Options header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should include X-Frame-Options header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('should include Content-Security-Policy header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['content-security-policy']).toContain("style-src 'self' 'unsafe-inline'");
  });

  it('should not include X-Powered-By header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('should include Strict-Transport-Security header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['strict-transport-security']).toBeDefined();
  });
});
