import AppDataSource from '@config/typeorm.config.prod';
import { Project } from '@projects/entities/project.entity';

/**
 * Curated "problem → role → outcome" spine for the featured projects,
 * replacing the raw README dump on their detail pages with a
 * recruiter-skimmable summary. Content reviewed and approved by Carlos
 * before being applied — see roadmap item #4.
 */
const projectSpines: Record<
  string,
  { problem: string; role: string; outcome: string }
> = {
  'space-server': {
    problem:
      'Wanted independence from third-party providers for core infrastructure (mail, hosting, monitoring) and full control over the data — outgrew a home-laptop server as usage grew.',
    role: 'Solo owner/operator — designed, deployed, and hardened the entire stack (Traefik edge, mail, apps, observability, alerting), including incident response.',
    outcome:
      '20 containers across 12 public subdomains on a single Hetzner VPS, replacing third-party mail/hosting with a self-managed stack: Traefik + Let’s Encrypt, docker-mailserver, Prometheus/Grafana/Alertmanager with Discord alerting, and Uptime Kuma.',
  },
  clarify: {
    problem:
      'Legal contracts (leases, ToS, business agreements) are dense and jargon-heavy, leaving most people unable to spot risky or unfavorable terms without paying for a lawyer.',
    role: 'Solo, end-to-end — the Nuxt 3/Nitro full stack, a 3-tier OpenAI analysis strategy, Supabase auth with Row Level Security, Stripe-based credit billing, and a BullMQ/Redis async job queue.',
    outcome:
      'A working end-to-end pipeline — upload → validated PDF → queued job → AI analysis → realtime dashboard — with a functioning credit/billing loop and production security controls (RLS, rate limiting, SSRF protection), deployed via Docker/Traefik with automated CI release/deploy.',
  },
  'nova-id': {
    problem:
      'Off-the-shelf identity providers (Auth0, Cognito) are black boxes; building on the Ory Stack instead meant owning the session validation, permission modeling, and Zero Trust enforcement rather than trusting a vendor SaaS.',
    role: 'Sole author — designed the Zero Trust topology (isolated Docker networks, no exposed internal ports), wrote all 15 Oathkeeper access rules, and built a dual RBAC model (platform vs. app roles).',
    outcome:
      'A working Zero Trust gateway where Oathkeeper is the only public bridge to the internal Ory services (Kratos, Hydra, Keto), with 3 integrated Vue 3 frontends and full self-service identity flows — login, recovery, TOTP, OAuth2 consent — working end-to-end.',
  },
  kovia: {
    problem:
      'Pet-rescue organizations were managing adoption applications through unstructured DMs and spreadsheets, with no way to flag risky applicants or track adoption history.',
    role: 'Designed and built the full-stack platform solo — a NestJS/Prisma/PostgreSQL backend with row-level-security multi-tenancy, a rule-based 0–100 applicant scoring engine, and a Nuxt 4 frontend with Google OAuth.',
    outcome:
      'A 356-test backend suite (green, CI-gated) with regression tests added specifically after two real bugs surfaced during development (an RLS-bypass mistype, a silently-dropped notification); multi-tenant isolation and adopter dashboards work end-to-end, piloted with a real rescue org in El Salvador.',
  },
  nightwire: {
    problem:
      'Building consistent, production-quality dark-mode UIs required a coherent token system, not one-off CSS per project — existing bases didn’t enforce the constraints wanted (pure-black surfaces, no decorative color, AI-agent-readable specs).',
    role: 'Sole author/maintainer — designed the token system and component CSS, wrote the AI-readable spec and a Claude Code skill for it, built the CLI installer, and set the versioning/migration discipline.',
    outcome:
      'Published and versioned on npm as a stable, semver-disciplined package (19 git tags from v1.0.0 through v2.0.1), and dogfooded in production as the actual design system of this portfolio site.',
  },
  lumira: {
    problem:
      'Claude Code and Qwen Code ship a bare statusline showing only model name and directory, leaving session-critical signals — context-window pressure, burn rate, rate-limit quota — invisible until you hit a wall.',
    role: 'Solo build — a zero-runtime-dependency TypeScript CLI with 7 themes, powerline rendering, WCAG-AA contrast enforced in CI, and dual Claude Code/Qwen Code support.',
    outcome:
      'Shipped 15+ releases with a maintained changelog, calibrated against real captured statusline payloads (e.g. the auto-compact threshold tuned to an observed trigger point), and actively downloaded via npm.',
  },
  'myths-and-legends-api': {
    problem:
      'Salvadoran oral folklore — La Ciguanaba, La Llorona, El Cadejo, and others — exists as scattered oral tradition rather than structured, queryable data.',
    role: 'Solo — designed the domain-driven data model and built the FastAPI/PostgreSQL REST API, including auth, migrations, and seed data.',
    outcome:
      'A working FastAPI service (OpenAPI docs, JWT auth, CRUD and search endpoints) seeded with named Salvadoran folklore entities, each tagged with category, type, location, and cited sources.',
  },
  'portfolio-api': {
    problem:
      'cativo.dev needed a backend for project/contact data and an AI chat assistant that answers visitor questions grounded in a canonical profile — while resisting prompt injection and profile-leak attempts.',
    role: 'Solo, full backend and ops — the NestJS API, TypeORM/Postgres data layer, JWT + API-key auth, Docker deployment, and the security/rate-limiting hardening, end to end.',
    outcome:
      'A production API with 32+ dated releases and 96%+ line coverage; JWT auth, an API-key auth path, and tiered per-endpoint rate limiting are all live in this exact service.',
  },
};

/* v8 ignore start */
async function updateProjectSpines(): Promise<void> {
  const dataSource = await AppDataSource.initialize();
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const projects = await queryRunner.manager.find(Project);
    console.log(`Found ${projects.length} projects`);

    let updatedCount = 0;

    for (const project of projects) {
      const spine = projectSpines[project.title];

      // Only fill in currently-missing fields — never overwrite a value that
      // was set some other way (e.g. a manual edit already made in prod).
      if (
        spine &&
        (project.problem == null ||
          project.role == null ||
          project.outcome == null)
      ) {
        await queryRunner.manager.update(Project, project.id, {
          problem: project.problem ?? spine.problem,
          role: project.role ?? spine.role,
          outcome: project.outcome ?? spine.outcome,
        });
        updatedCount++;
        console.log(`Updated spine for project: ${project.title}`);
      }
    }

    await queryRunner.commitTransaction();
    console.log(`\nUpdate complete: ${updatedCount} project(s) updated`);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Update failed, rolled back:', error);
    throw error;
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

updateProjectSpines()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Update error:', error);
    process.exit(1);
  });
/* v8 ignore stop */
