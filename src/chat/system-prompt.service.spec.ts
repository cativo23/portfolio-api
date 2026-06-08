import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { SystemPromptService } from './system-prompt.service';
import { ProfileService } from '@profile/profile.service';
import type { GroundingProfile } from '@profile/profile-grounding';

const FIXTURE: GroundingProfile = {
  name: 'Ada Lovelace',
  title: 'Chief Difference Engineer',
  location: 'London',
  yearsOfExperience: 12,
  summary: ['Pioneered the very first algorithm intended for a machine.'],
  highlightedMetrics: ['Wrote the first published computer program.'],
  experience: [
    {
      role: 'Analyst',
      company: 'Analytical Engine Co',
      period: '1842 → 1843',
      location: 'London',
      description: 'Annotated Menabrea memoir; designed Bernoulli routine.',
      highlights: ['First algorithm for the Analytical Engine.'],
      stack: ['Punch cards'],
    },
  ],
  projects: [
    {
      name: 'Bernoulli Routine',
      status: 'historic',
      description: 'Computes Bernoulli numbers.',
      stack: 'Analytical Engine',
    },
  ],
  openSource: [
    { name: 'notes', downloads: 'n/a', description: 'Translator notes G–G.' },
  ],
  skills: [{ name: 'Math', items: ['Algorithms', 'Calculus'] }],
  education: 'Tutored privately in mathematics.',
  outsideCode: ['Horse racing math.'],
  openTo: 'Open to engine collaborations.',
  fit: {
    positioning: 'Deepest on mechanical computation; a pioneer, not a clerk.',
    boundaries: [
      'Not a fit for hand-tabulation roles — her depth is algorithms.',
    ],
    routeToDirect: 'For terms, write to her directly.',
  },
  contact: {
    emails: ['ada@example.com'],
    github: 'https://github.com/ada',
    linkedin: 'https://www.linkedin.com/in/ada-lovelace',
    website: 'https://ada.example',
  },
};

describe('SystemPromptService', () => {
  let service: SystemPromptService;
  const mockProfileService = { getGroundingProfile: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemPromptService,
        { provide: ProfileService, useValue: mockProfileService },
      ],
    }).compile();

    service = module.get<SystemPromptService>(SystemPromptService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('with the real canonical profile', () => {
    beforeEach(() => {
      // Use the actual ProfileService data to assert real facts are present.
      const real = new ProfileService();
      mockProfileService.getGroundingProfile.mockReturnValue(
        real.getGroundingProfile(),
      );
    });

    it('includes key identity facts about Carlos', () => {
      const prompt = service.build();
      expect(prompt).toContain('Carlos Cativo');
      expect(prompt).toContain(
        'Senior Tech Lead — Payments, Healthcare & Backend',
      );
      expect(prompt).toContain('Blue Medical');
      expect(prompt).toContain('sofIA');
      expect(prompt).toContain('NestJS');
      expect(prompt).toContain('linkedin.com/in/carlos-cativo');
    });

    it('includes anti-injection guardrails', () => {
      const prompt = service.build();
      expect(prompt.toLowerCase()).toContain('scope check first');
      expect(prompt.toLowerCase()).toContain('ignore previous instructions');
      expect(prompt.toLowerCase()).toMatch(/decline|off-topic|unrelated/);
    });

    it('instructs the model to scope-check and refuse off-profile definition requests', () => {
      const prompt = service.build().toLowerCase();
      expect(prompt).toContain('scope check first');
      expect(prompt).toMatch(/define|explain|what is/);
      expect(prompt).toMatch(
        /does not make a request to define that term in-scope/,
      );
    });

    it('includes a definition-refusal few-shot (the observed failure mode)', () => {
      expect(service.build().toLowerCase()).toContain(
        'what is quantum computing',
      );
    });

    it('includes a Spanish off-profile refusal example (bilingual contract)', () => {
      expect(service.build()).toContain('¿Qué es Docker');
    });

    it('includes a contrastive in-scope example using a profile term', () => {
      // "Does Carlos Cativo use Docker?" must be ANSWERED, not refused — guards over-refusal
      expect(service.build()).toContain('Does Carlos Cativo use Docker?');
    });

    it('strengthens never-invent to forbid inference and generalization', () => {
      expect(service.build().toLowerCase()).toMatch(/never invent or infer/);
    });

    it('renders the curated fit/boundary section from the profile', () => {
      const prompt = service.build();
      // positioning framing + the only-these-boundaries fence
      expect(prompt).toContain('## Fit');
      expect(prompt.toLowerCase()).toContain('backend center of gravity');
      expect(prompt.toLowerCase()).toContain('only limitations you may state');
      // a real curated boundary (applied-AI, not ML research)
      expect(prompt.toLowerCase()).toMatch(
        /does not train or fine-tune models/,
      );
    });

    it('instructs fit/weakness questions to reframe as mutual fit, not flaws', () => {
      const prompt = service.build().toLowerCase();
      expect(prompt).toContain('fit & weakness questions');
      expect(prompt).toMatch(/mutual fit/);
      expect(prompt).toContain('biggest weakness'); // few-shot present
    });

    it('forbids the bot from discussing compensation', () => {
      const prompt = service.build().toLowerCase();
      expect(prompt).toMatch(
        /never discuss, estimate, or negotiate compensation/,
      );
      expect(prompt).toContain('how much does carlos cativo charge'); // comp few-shot
    });
  });

  it('is fully data-driven — rebuilds from whatever the profile returns', () => {
    mockProfileService.getGroundingProfile.mockReturnValue(FIXTURE);
    const prompt = service.build();

    expect(prompt).toContain('Ada Lovelace');
    expect(prompt).toContain('Chief Difference Engineer');
    expect(prompt).toContain('Bernoulli Routine');
    // Guardrails reference the profile name dynamically, not a hardcoded one.
    expect(prompt).not.toContain('Carlos');
  });
});
