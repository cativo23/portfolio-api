import { ExecutionContext } from '@nestjs/common';

// Import the factory function directly to test it
// This is the function that's passed to createParamDecorator in user.decorator.ts
const userFactory = (data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
};

describe('User Decorator Factory', () => {
  it('should extract user from request', () => {
    // Mock data
    const mockUser = { id: 1, username: 'testuser' };

    // Mock execution context
    const mockExecutionContext: ExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: mockUser
        })
      })
    } as unknown as ExecutionContext;

    // Call the factory function with our mock context
    const result = userFactory(null, mockExecutionContext);

    // Verify the result
    expect(result).toEqual(mockUser);
    expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
    expect(mockExecutionContext.switchToHttp().getRequest).toHaveBeenCalled();
  });
});
