import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface User {
  id: number;
  [key: string]: any;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: User }>();
    // console.log('CurrentUser decorator called', request);
    return request.user; // Return the user object from the request
  },
);
