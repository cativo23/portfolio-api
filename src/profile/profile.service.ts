import { Injectable } from '@nestjs/common';
import {
  ProfileResponseDto,
  ProfileExperienceDto,
  ProfileSkillCategoryDto,
} from './dto/profile-response.dto';

@Injectable()
export class ProfileService {
  private readonly profile: ProfileResponseDto;

  constructor() {
    this.profile = {
      name: 'Carlos Cativo',
      title: 'Tech Lead / Full-Stack Engineer',
      yearsOfExperience: 9,
      location: 'San Salvador, El Salvador',
      summary:
        'Remote Tech Lead and Full-Stack Software Engineer with 9 years of experience building healthcare platforms, payment systems, and AI-powered products. Currently leading development at Blue Medical, I specialize in NestJS, Laravel, Python, and AI integration.',
      experience: [
        {
          company: 'Blue Medical Guatemala',
          role: 'Tech Lead / Full-Stack Engineer',
          period: 'Apr 2022 - Present',
          location: 'Guatemala (Remote)',
        },
        {
          company: 'OrangeSoftCo (Publimovil Regional)',
          role: 'Back End Developer',
          period: 'Sep 2020 - Apr 2022',
          location: 'San Marcos, El Salvador',
        },
        {
          company: 'Mussol',
          role: 'Senior Developer',
          period: 'Apr 2017 - Sep 2020',
          location: 'El Salvador',
        },
      ] as ProfileExperienceDto[],
      skills: [
        {
          name: 'Languages',
          skills: [
            { name: 'TypeScript', level: 'advanced' },
            { name: 'PHP', level: 'advanced' },
            { name: 'SQL', level: 'advanced' },
            { name: 'Python', level: 'intermediate' },
            { name: 'JavaScript', level: 'advanced' },
            { name: 'Bash', level: 'intermediate' },
          ],
        },
        {
          name: 'Backend',
          skills: [
            { name: 'NestJS', level: 'advanced' },
            { name: 'Laravel', level: 'advanced' },
            { name: 'FastAPI', level: 'intermediate' },
          ],
        },
        {
          name: 'Frontend',
          skills: [
            { name: 'Vue / Nuxt', level: 'advanced' },
            { name: 'TailwindCSS', level: 'advanced' },
            { name: 'Angular', level: 'intermediate' },
          ],
        },
        {
          name: 'Databases',
          skills: [
            { name: 'PostgreSQL', level: 'advanced' },
            { name: 'MySQL', level: 'advanced' },
            { name: 'Redis', level: 'intermediate' },
            { name: 'Meilisearch', level: 'intermediate' },
          ],
        },
        {
          name: 'AI / ML',
          skills: [
            { name: 'Anthropic Claude API', level: 'advanced' },
            { name: 'ElevenLabs ConvAI', level: 'advanced' },
            { name: 'OpenAI API', level: 'intermediate' },
            { name: 'n8n', level: 'intermediate' },
          ],
        },
        {
          name: 'Infrastructure',
          skills: [
            { name: 'Docker', level: 'advanced' },
            { name: 'GitHub Actions', level: 'advanced' },
            { name: 'AWS (S3, ECR, EC2)', level: 'intermediate' },
            { name: 'Traefik', level: 'intermediate' },
          ],
        },
      ] as ProfileSkillCategoryDto[],
      differentiators: [
        'AI + Backend hybrid — designing multi-agent systems with validation and deterministic safeguards',
        'Payment & invoicing domain expertise — ISO 8583, SOAP, tokenization, FEL electronic invoicing',
        'Healthcare domain — medication platforms, patient scheduling, insurance authorization',
        'Full product ownership — built entire microservices from scratch',
        'Infrastructure & self-hosting — production infrastructure on own domain',
        'Security-conscious — OWASP audits, proper auth patterns',
      ],
      github: 'https://github.com/cativo23',
      linkedin: 'https://linkedin.com/in/cativo23',
      website: 'https://cativo.dev',
    };
  }

  getProfile(): ProfileResponseDto {
    return this.profile;
  }
}
