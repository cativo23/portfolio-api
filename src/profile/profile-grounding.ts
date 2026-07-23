/**
 * Canonical grounding profile for the AI chatbot. This is the single source of
 * truth for what the bot knows about Carlos. It is a superset reconciled from
 * the portfolio's official CV surfaces (about page narrative + printable CV).
 *
 * This is the only consumer of ProfileService — the frontend renders the CV
 * itself, so there is no public profile API. Edit this file to change what the
 * bot can say.
 */

export interface GroundingExperience {
  role: string;
  company: string;
  period: string;
  location: string;
  description: string;
  highlights?: string[];
  stack: string[];
}

export interface GroundingProject {
  name: string;
  status: string;
  description: string;
  stack: string;
}

export interface GroundingPackage {
  name: string;
  downloads: string;
  description: string;
}

export interface GroundingSkillCategory {
  name: string;
  items: string[];
}

/**
 * Curated fit / lead-qualification data. This is the ONLY source of "boundary"
 * statements the bot may make — it never reasons about weaknesses on its own
 * (that would be fabrication and a prompt-injection lever). `positioning` is the
 * always-first framing; `boundaries` are honest fit limits phrased as focus, not
 * flaws, each with the adjacent strength baked in; `routeToDirect` is where the
 * bot sends anything it must not negotiate (e.g. compensation).
 */
export interface GroundingFit {
  positioning: string;
  boundaries: string[];
  routeToDirect: string;
}

export interface GroundingProfile {
  name: string;
  title: string;
  location: string;
  yearsOfExperience: number;
  summary: string[];
  highlightedMetrics: string[];
  experience: GroundingExperience[];
  projects: GroundingProject[];
  openSource: GroundingPackage[];
  skills: GroundingSkillCategory[];
  education: string;
  outsideCode: string[];
  openTo: string;
  fit: GroundingFit;
  contact: {
    emails: string[];
    github: string;
    linkedin: string;
    website: string;
  };
}

export const CARLOS_GROUNDING: GroundingProfile = {
  name: 'Carlos Cativo',
  title: 'Senior Tech Lead — Payments, Healthcare & Backend',
  location: 'El Salvador (UTC-6) · works in EN/ES',
  yearsOfExperience: 9,
  summary: [
    "9 years writing backends in El Salvador. Most of that has been microservices and full-stack tech leadership at Blue Medical Guatemala — leading BlueMeds end-to-end (Laravel API + Angular/Ionic admin), then breaking out Payment Service and Invoice Service as standalone Laravel microservices that real clinics bill against every day. The fintech and tax stack in the region is hard in a specific way: no nice SDKs, sparse docs, heterogeneous protocols across processors. Carlos has implemented multi-gateway payment integration by hand — ISO 8583, SOAP/XML, REST — behind a Strategy Pattern so the next processor is a config swap, not a rewrite. Same approach on Invoice Service for Guatemala's FEL e-invoicing through an authorized provider.",
    'Over the last ~6 months Carlos has been extending into AI work on top of the backend foundation. He is the primary author of sofIA, a multi-agent voice system at Blue Medical for healthcare scheduling on ElevenLabs ConvAI, currently in production. Most of the engineering work is on the parts AI demos skip: state-machine workflow design, validation layers around tool calls, retry and recovery logic, and the operations dashboard the team uses to see what the agent actually did. The pattern he cares about isn\'t "call an LLM" — it\'s the deterministic safeguards around the LLM that keep it from blowing up in production.',
    'He also runs his own production infrastructure at cativo.dev — 16 containers across 6 stacks (apps, blog, mail, monitoring, proxy, databases) — because running it yourself is the only way to actually understand what you ship into prod.',
  ],
  highlightedMetrics: [
    'Currently leads a team of 5 engineers at Blue Medical Guatemala.',
    'Scaled a payment platform from ~$30K to ~$450K USD/month while shipping 3 services from scratch.',
  ],
  experience: [
    {
      role: 'Tech Lead / Full-Stack Engineer',
      company: 'Blue Medical Guatemala',
      period: 'Apr 2022 → Present (3+ yrs)',
      location: 'Guatemala (Remote)',
      description:
        'Lead developer across payment, e-invoicing, subscription, and AI voice platforms — owns design, delivery, and on-call from greenfield to production. Leads a team of 5 engineers.',
      highlights: [
        'sofIA — Multi-agent voice system for healthcare scheduling, in production. Primary author of a state-machine workflow on ElevenLabs ConvAI + n8n with deterministic validation, retry, and recovery layers around tool calls. Built the management platform: FastAPI API + Nuxt dashboard + Typer CLI.',
        'Payment Service — Built from scratch in Laravel. Multi-gateway abstraction (Strategy Pattern) over heterogeneous protocols (ISO 8583, SOAP/XML, REST). VGS card vault for PCI-friendly tokenization (raw PAN never touches the service DB), network tokenization, per-commerce / per-card-token routing, Horizon queues per gateway, Livewire ops dashboard. Led an OWASP-grade security audit and ongoing hardening.',
        "Invoice Service — Built from scratch in Laravel. Guatemala's FEL e-invoicing through an authorized provider, Strategy Pattern for provider swaps, SAP integration, async pipeline via Redis/Horizon, QR code generation, multi-establishment support, Livewire analytics dashboard.",
        'BlueMeds — Medication subscription platform: lifecycle, delivery scheduling, insurance authorization, referral codes, Meilisearch catalog search, and 10+ third-party integrations across ERP, CRM, messaging, AI calling, and healthcare middleware.',
        'BlueMeds Admin Panel — Angular/Ionic admin for the pharmaceutical platform with i18n EN/ES, Capacitor mobile build, Tailwind.',
      ],
      stack: [
        'Laravel',
        'PHP',
        'NestJS',
        'FastAPI',
        'Python',
        'Livewire',
        'Nuxt',
        'Angular/Ionic',
        'PostgreSQL',
        'MySQL',
        'Redis/Horizon',
        'Meilisearch',
        'AWS',
        'Docker',
        'Bitbucket Pipelines',
        'Sentry',
        'ElevenLabs ConvAI',
      ],
    },
    {
      role: 'Backend Developer',
      company: 'OrangeSoftCo (Publimovil Regional)',
      period: 'Sep 2020 – Apr 2022 (1.5 yrs)',
      location: 'San Marcos, El Salvador',
      description:
        'Re-architected the Y.O.D.A. monolith into microservices with Redis Streams for inter-service communication, improving end-to-end performance ~30%. Tightened GitLab CI/CD and Docker/K8s deploys on DigitalOcean, cutting build time ~20%.',
      stack: [
        'Laravel',
        'FastAPI',
        'Python',
        'MySQL',
        'Redis Streams',
        'Docker',
        'Kubernetes',
        'GitLab CI/CD',
        'DigitalOcean',
      ],
    },
    {
      role: 'Senior Developer',
      company: 'Mussol (TripXpertz)',
      period: 'Apr 2017 – Sep 2020 (3.5 yrs)',
      location: 'El Salvador',
      description:
        'Built an internal dashboard administering 100+ travel websites; set up AWS-based CI/CD that improved deploy time and reliability. Also shipped C#/Unity mobile games.',
      stack: ['Laravel', 'MySQL', 'AWS', 'C# / Unity'],
    },
  ],
  projects: [
    {
      name: 'VittBot',
      status: 'personal · in development',
      description:
        'Multi-agent BTC/USDT trading bot on Binance: an indicator pipeline feeds three Claude agents (Analyst, Trader, Validator) backed by a deterministic risk manager with 10 hard-coded rules that is never delegated to AI.',
      stack: 'NestJS, TypeScript, Anthropic SDK, CCXT, Prisma + PostgreSQL',
    },
    {
      name: 'nova-id',
      status: 'personal · in development',
      description:
        'Zero Trust IAM stack using the Ory suite (Kratos, Hydra, Keto, Oathkeeper) with a NestJS admin API and Vue console.',
      stack: 'Ory Stack, NestJS, Vue, Docker',
    },
    {
      name: 'Clarify',
      status: 'personal · in development',
      description:
        'AI legal-contract auditor (v1.0.0-alpha). PDF analysis, pay-per-analysis credits via Stripe webhooks, async processing on BullMQ.',
      stack: 'Nuxt, Supabase (Postgres + RLS), OpenAI, Stripe, BullMQ + Redis',
    },
    {
      name: 'cativo.dev infrastructure',
      status: 'self-hosted',
      description:
        'Self-hosted production stack: 16 containers across 6 stacks (apps, blog, mail, monitoring, proxy, databases) on his own infrastructure.',
      stack: 'Docker Compose, Linux, UFW, TLS, DNS',
    },
  ],
  openSource: [
    {
      name: 'lumira',
      downloads: '~1.8K downloads/mo',
      description:
        'Real-time statusline HUD for Claude Code and Qwen Code. Session analytics, latency overhead widget, quota projection. Zero deps. TypeScript, npm.',
    },
    {
      name: 'nightwire',
      downloads: '~84 downloads/mo',
      description:
        'Dark cyberpunk UI design system. Semantic color roles, neon palette, CLI installer. CSS, npm.',
    },
  ],
  skills: [
    {
      name: 'Languages',
      items: ['TypeScript', 'JavaScript', 'PHP', 'Python', 'Bash', 'SQL'],
    },
    { name: 'Backend', items: ['NestJS', 'Laravel 10/11', 'FastAPI'] },
    { name: 'Frontend', items: ['Nuxt/Vue', 'Angular', 'Ionic', 'Tailwind'] },
    {
      name: 'Data',
      items: [
        'PostgreSQL (Prisma, SQLAlchemy, Eloquent)',
        'MySQL',
        'Redis',
        'Meilisearch',
        'Supabase',
      ],
    },
    {
      name: 'AI / Integrations',
      items: [
        'Anthropic Claude API',
        'OpenAI',
        'ElevenLabs ConvAI',
        'multi-agent design',
        'n8n',
        'Stripe',
        'Odoo',
        'SAP',
        'WhatsApp/Botmaker',
        'Bland AI',
      ],
    },
    {
      name: 'Payments / Tax',
      items: [
        'Multi-gateway integration over heterogeneous protocols (ISO 8583, SOAP/XML, REST)',
        'VGS card vault',
        'network tokenization',
        'FEL e-invoicing (Guatemala)',
        'SAP',
      ],
    },
    {
      name: 'Infra / DevOps',
      items: [
        'Docker',
        'Traefik',
        'Nginx',
        'AWS (S3/ECR/EC2)',
        'Cloudflare',
        'GitHub Actions',
        'Bitbucket Pipelines',
        'Prometheus',
        'Sentry',
      ],
    },
    {
      name: 'Testing',
      items: ['Pest/PHPUnit', 'Vitest', 'Jest', 'BATS', 'TDD'],
    },
  ],
  education:
    'B.Sc. Computer Systems Engineering, Universidad de El Salvador (2023). Specialization in Cloud Infrastructure.',
  outsideCode: [
    'Three rescued dogs — Nova, Vitto, and Kovu. They name the projects.',
    'Civic Type R FK8 (Rallye Red).',
    'Mechanical keyboards & IEMs (Truthear ZERO:RED in rotation).',
    'Linux ricing — Hyprland on Arch with a Tokyo Night Waybar.',
    'Cyberpunk & sci-fi — Akira, Evangelion, Ghost in the Shell.',
    'Self-hosting tinkering on cativo.dev.',
  ],
  openTo:
    'Open to Senior Backend, Tech Lead, and Engineering Manager roles — remote-first or with relocation sponsorship.',
  fit: {
    positioning:
      'Senior tech lead and engineer with a backend center of gravity — payments, healthcare platforms, and production AI systems. Full-stack who ships solid frontend (Vue/Nuxt, Angular, even a design system), but goes deepest on backend architecture. Comfortable running real production infrastructure himself (self-hosts 16 containers — Docker, Traefik, AWS — and lives in the terminal). Depth in one area is the senior signal, not a gap.',
    boundaries: [
      "Seniority: he's a fit for senior IC, tech lead, and engineering-manager roles. Junior or mid-level positions would underuse him — he's past that level. A strong senior individual-contributor role with no direct reports is absolutely a fit.",
      'AI: he is an applied engineer — he builds LLM and multi-agent systems in production with deterministic safeguards (sofIA, VittBot, Clarify). He does not train or fine-tune models, do ML research, data science, or MLOps. The research/training end is not his lane; taking models and shipping them reliably is.',
      'Frontend: he is full-stack with a backend center of gravity. He ships solid frontend to deliver a product end to end, but does not position as a dedicated frontend or UI/UX specialist — his senior depth is backend.',
      'Mobile: he ships hybrid mobile with Ionic/Capacitor (and has older C#/Unity history). Native iOS/Android in Swift or Kotlin is not his specialty — hybrid plus a strong backend is the fit; deep native mobile is not.',
      'Location: he is in El Salvador (UTC-6), remote-first, open to relocation with sponsorship. On-site in a far-off timezone with no remote or relocation is not workable; remote or relocation-sponsored is.',
      'Infrastructure: he runs real production infrastructure himself and is comfortable deep in the terminal and on servers (Docker, Traefik, k8s exposure, AWS) — infra in service of shipping product, with strong ops instincts. He is not a dedicated SRE or platform specialist operating at large scale (SLOs, fleet-wide observability, big on-call rotations). Backend with a DevOps streak is the fit; a pure platform-engineering seat at scale is not his target.',
      'Management: he is open to engineering-manager roles, but he is hands-on. A fully non-coding, pure people-management role is not the fit; an EM or lead role that stays close to the code is.',
      'Scale: his depth is end-to-end product ownership at a startup / scale-up — he has led from greenfield to production and owns systems fully, with real autonomy. The fit is someone who thrives owning the whole stack end to end.',
    ],
    routeToDirect:
      'For compensation, rates, or anything that needs negotiating, that is a direct conversation — reach Carlos at cativo@cativo.dev.',
  },
  contact: {
    emails: ['cativo@cativo.dev', 'cativo23.kt@gmail.com'],
    github: 'https://github.com/cativo23',
    linkedin: 'https://www.linkedin.com/in/carlos-cativo',
    website: 'https://cativo.dev',
  },
};
