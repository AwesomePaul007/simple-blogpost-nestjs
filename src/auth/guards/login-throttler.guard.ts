import { Injectable } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  // This guard can be used to implement throttling logic for login attempts
  // For example, you can use it to limit the number of login attempts from a single IP address
  // or to enforce a cooldown period after a certain number of failed login attempts.

  protected async getTracker(req): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const email = req.body?.email;
    return Promise.resolve(`login-${email}`);
  }

  protected getLimit(): Promise<number> {
    // Define the limit for login attempts, e.g., 5 attempts per minute
    return Promise.resolve(5);
  }

  protected getTtl(): Promise<number> {
    return Promise.resolve(60);
  }

  protected throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      'Too many login attempts. Please try again later after 1 minute.',
    );
  }
}
