import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { AuthenticationException } from '@core/exceptions';
import { Role } from '@users/entities/user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector) as jest.Mocked<Reflector>;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockContext: ExecutionContext;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = { user: {} };
      mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;
    });

    it('should return true when no roles are required', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return true when user has required role', async () => {
      reflector.getAllAndOverride.mockReturnValue(['admin' as Role]);
      mockRequest.user = { sub: 1, roles: ['admin'] };

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should throw AuthenticationException when user has no roles', async () => {
      reflector.getAllAndOverride.mockReturnValue(['admin' as Role]);
      mockRequest.user = { sub: 1 };

      expect(() => guard.canActivate(mockContext)).toThrow(
        AuthenticationException,
      );
    });

    it('should throw AuthenticationException when user has wrong role', async () => {
      reflector.getAllAndOverride.mockReturnValue(['admin' as Role]);
      mockRequest.user = { sub: 1, roles: ['user'] };

      expect(() => guard.canActivate(mockContext)).toThrow(
        AuthenticationException,
      );
    });

    it('should return true when user has one of multiple required roles', async () => {
      reflector.getAllAndOverride.mockReturnValue(['admin' as Role, 'user' as Role]);
      mockRequest.user = { sub: 1, roles: ['user'] };

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });
  });
});
