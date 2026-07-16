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

function container(project?: string) {
  return { Labels: project ? { 'com.docker.compose.project': project } : {} };
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

  it('counts running containers and distinct compose stacks', async () => {
    mockHttpService.get.mockReturnValue(
      of({
        data: [
          container('portfolio'),
          container('portfolio'),
          container('space-server'),
          container('ghost'),
          container(), // standalone container, no compose project
        ],
      }),
    );

    const stats = await service.getStats();

    expect(stats).toEqual({ containers: 5, stacks: 3 });
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

    expect(stats).toEqual({ containers: null, stacks: null });
  });

  it('returns zeroes when no containers are running', async () => {
    mockHttpService.get.mockReturnValue(of({ data: [] }));

    const stats = await service.getStats();

    expect(stats).toEqual({ containers: 0, stacks: 0 });
  });
});
