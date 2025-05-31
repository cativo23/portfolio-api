import { ExecutionContext } from '@nestjs/common';
import { extractUser, User } from './user.decorator';

describe('User Decorator', () => {
  describe('extractUser', () => {
    it('should extract the entire user object when no property is specified', () => {
      // Mock data
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      };

      // Mock execution context
      const mockExecutionContext: ExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: mockUser,
          }),
        }),
      } as unknown as ExecutionContext;

      // Call the extractUser function with our mock context
      const result = extractUser(undefined, mockExecutionContext);

      // Verify the result
      expect(result).toEqual(mockUser);
      expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
      expect(mockExecutionContext.switchToHttp().getRequest).toHaveBeenCalled();
    });

    it('should extract a specific property from the user object when property is specified', () => {
      // Mock data
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      };
      const propertyToExtract = 'username';

      // Mock execution context
      const mockExecutionContext: ExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: mockUser,
          }),
        }),
      } as unknown as ExecutionContext;

      // Call the extractUser function with our mock context and property
      const result = extractUser(propertyToExtract, mockExecutionContext);

      // Verify the result
      expect(result).toEqual(mockUser[propertyToExtract]);
      expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
      expect(mockExecutionContext.switchToHttp().getRequest).toHaveBeenCalled();
    });

    it('should return undefined when user is not present in the request', () => {
      // Mock execution context with no user
      const mockExecutionContext: ExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: undefined,
          }),
        }),
      } as unknown as ExecutionContext;

      // Call the extractUser function with our mock context
      const result = extractUser(undefined, mockExecutionContext);

      // Verify the result
      expect(result).toBeUndefined();
      expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
      expect(mockExecutionContext.switchToHttp().getRequest).toHaveBeenCalled();
    });
  });

  // Test the decorator itself
  describe('User Decorator', () => {
    it('should be defined', () => {
      expect(User).toBeDefined();
    });
  });
});
