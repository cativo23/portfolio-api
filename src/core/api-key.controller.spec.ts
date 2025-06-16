import { ApiKeyController } from './api-key.controller';
import { ApiKeyService } from './api-key.service';

describe('ApiKeyController (unit)', () => {
  let controller: ApiKeyController;
  let service: ApiKeyService;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      revokeById: jest.fn(),
    } as any;
    controller = new ApiKeyController(service);
  });

  it('should create an API key', async () => {
    (service.create as jest.Mock).mockResolvedValue({
      id: 1,
      key: 'abc',
      description: 'desc',
    });
    const result = await controller.create('desc');
    expect(result.status).toBe('success');
    expect(result.data.key).toBe('abc');
    expect(result.data.description).toBe('desc');
  });

  it('should list API keys', async () => {
    (service.findAll as jest.Mock).mockResolvedValue([
      { id: 1, description: 'desc' },
    ]);
    const result = await controller.findAll();
    expect(result.status).toBe('success');
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('should revoke an API key', async () => {
    (service.revokeById as jest.Mock).mockResolvedValue(undefined);
    const result = await controller.revoke('1');
    expect(result.status).toBe('success');
    expect(result.data.id).toBe(1);
  });
});
