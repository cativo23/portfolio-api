import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the user from the request.
 * 
 * @param data Optional property name to extract from the user object
 * @returns The user object or a specific property if data is provided
 * 
 * @example
 * // Get the entire user object
 * @User() user: any
 * 
 * @example
 * // Get a specific property from the user object
 * @User('username') username: string
 */

export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);