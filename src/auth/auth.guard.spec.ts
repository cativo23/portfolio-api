import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { AuthenticationException } from '@core/exceptions';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockContext: ExecutionContext;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        headers: {},
      };
      mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ExecutionContext;
    });

    it('should throw AuthenticationException when no token is provided', async () => {
      mockRequest.headers.authorization = undefined;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        AuthenticationException,
      );
    });

    it('should throw AuthenticationException when authorization header has invalid format', async () => {
      mockRequest.headers.authorization = 'InvalidFormat';

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        AuthenticationException,
      );
    });

    it('should throw AuthenticationException when token type is not Bearer', async () => {
      mockRequest.headers.authorization = 'Basic token123';

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        AuthenticationException,
      );
    });

    it('should throw AuthenticationException when token verification fails', async () => {
      mockRequest.headers.authorization = 'Bearer validToken';
      configService.get.mockReturnValue('jwt_secret');
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        AuthenticationException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('validToken', {
        secret: 'jwt_secret',
      });
    });

    it('should return true and set user in request when token is valid', async () => {
      const mockPayload = { sub: 1, username: 'testuser' };
      mockRequest.headers.authorization = 'Bearer validToken';
      configService.get.mockReturnValue('jwt_secret');
      jwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual(mockPayload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('validToken', {
        secret: 'jwt_secret',
      });
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    });
  });
});
