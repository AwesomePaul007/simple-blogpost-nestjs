import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserEntity } from 'src/auth/entities/user-entity';

export interface UserEvent {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  timestamp: Date;
}

@Injectable()
export class UserEventsService {
  constructor(
    private readonly eventEmitter: EventEmitter2, // Assuming you have an EventEmitter2 instance injected
  ) {}

  // Method to emit user-related events
  emitUserEvent(user: UserEntity): void {
    const userRegisterEvent: UserEvent = {
      user: {
        id: `${user.id}`,
        email: user.email,
        name: user.name,
      },
      timestamp: new Date(),
    };
    this.eventEmitter.emit('user.registered', userRegisterEvent);
  }
}
