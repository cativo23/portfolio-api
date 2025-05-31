import { ExecutionContext } from '@nestjs/common';
import { extractUser, User } from './user.decorator';

describe('User Decorator', () => {
  let mockExecutionContext: ExecutionContext;
  let getRequestMock: jest.Mock;

  beforeEach(() => {
    getRequestMock = jest.fn();
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: getRequestMock,
      }),
    } as unknown as ExecutionContext;
  });

  describe('extractUser', () => {
    it('should extract the entire user object when no property is specified', () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      };

      getRequestMock.mockReturnValue({ user: mockUser });

      const result = extractUser(undefined, mockExecutionContext);

      expect(result).toEqual(mockUser);
      expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
      expect(getRequestMock).toHaveBeenCalled();
    });

    it('should extract a specific property from the user object', () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      };
      const propertyToExtract = 'username';

      getRequestMock.mockReturnValue({ user: mockUser });

      const result = extractUser(propertyToExtract, mockExecutionContext);

      expect(result).toEqual(mockUser[propertyToExtract]);
      expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
      expect(getRequestMock).toHaveBeenCalled();
    });

    it('should return undefined when user is not present', () => {
      getRequestMock.mockReturnValue({ user: undefined });

      const result = extractUser(undefined, mockExecutionContext);

      expect(result).toBeUndefined();
      expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
      expect(getRequestMock).toHaveBeenCalled();
    });

    it('should return undefined when requested property is not present', () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
      };

      getRequestMock.mockReturnValue({ user: mockUser });

      const result = extractUser('nonExistentProp', mockExecutionContext);

      expect(result).toBeUndefined();
      expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
      expect(getRequestMock).toHaveBeenCalled();
    });
  });

  describe('User Decorator Factory', () => {
    it('should be defined', () => {
      expect(User).toBeDefined();
    });
  });
});
