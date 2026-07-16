import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InfraService } from './infra.service';

const mockHttpService = {
  get: vi.fn(),
};

const mockConfigService = {
  getOrThrow: vi.fn().mockReturnValue({
    dockerProxyUrl: 'http://dockerproxy:2375',
  }),
};

function container(project?: string, exposed = true) {
  const labels: Record<string, string> = {};
  if (project) labels['com.docker.compose.project'] = project;
  if (exposed) labels['traefik.enable'] = 'true';
  return { Labels: labels };
}

describe('InfraService', () => {
  let service: InfraService;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockConfigService.getOrThrow.mockReturnValue({
      dockerProxyUrl: 'http://dockerproxy:2375',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InfraService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<InfraService>(InfraService);
  });

  it('counts only Traefik-exposed services but all distinct compose stacks', async () => {
    mockHttpService.get.mockReturnValue(
      of({
        data: [
          container('portfolio'), // exposed
          container('portfolio'), // exposed
          container('space-server'), // exposed
          container('ghost'), // exposed
          container('monitoring', false), // internal-only stack, no traefik label
          container(undefined, false), // standalone internal container
          {}, // container summary with no Labels key at all
        ],
      }),
    );

    const stats = await service.getStats();

    // 4 containers carry traefik.enable=true → 4 services; stacks span all
    // compose projects (portfolio, space-server, ghost, monitoring) → 4.
    expect(stats).toEqual({ services: 4, stacks: 4 });
    expect(mockHttpService.get).toHaveBeenCalledWith(
      'http://dockerproxy:2375/containers/json',
      expect.objectContaining({ timeout: expect.any(Number) }),
    );
  });

  it('degrades to nulls when the docker proxy is unreachable', async () => {
    mockHttpService.get.mockReturnValue(
      throwError(() => new Error('ECONNREFUSED')),
    );

    const stats = await service.getStats();

    expect(stats).toEqual({ services: null, stacks: null });
  });

  it('returns zeroes when no containers are running', async () => {
    mockHttpService.get.mockReturnValue(of({ data: [] }));

    const stats = await service.getStats();

    expect(stats).toEqual({ services: 0, stacks: 0 });
  });
});
