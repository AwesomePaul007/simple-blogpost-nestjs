import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserEvent } from '../user-events.services';

Injectable();
export class UserRegisteredListeners {
  private readonly logger = new Logger(UserRegisteredListeners.name);

  @OnEvent('user.registered')
  handleUserRegisteredEvent(event: UserEvent): void {
    const { user, timestamp } = event;
    this.logger.log(`
      Welcome, ${user.email}! Your Account was created at ${timestamp.toISOString()}
    `);
  }
}
