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
      expect(prompt).toContain('Senior Tech Lead — Payments, Healthcare & Backend');
      expect(prompt).toContain('Blue Medical');
      expect(prompt).toContain('sofIA');
      expect(prompt).toContain('NestJS');
      expect(prompt).toContain('linkedin.com/in/carlos-cativo');
    });

    it('includes anti-injection guardrails', () => {
      const prompt = service.build();
      expect(prompt.toLowerCase()).toContain('only answer questions about');
      expect(prompt.toLowerCase()).toContain('ignore previous instructions');
      expect(prompt.toLowerCase()).toMatch(/decline|off-topic|unrelated/);
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
