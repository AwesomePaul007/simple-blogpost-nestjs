import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserEventsService } from './user-events.services';
import { UserRegisteredListeners } from './listeners/user-register.listeners';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      global: true,
      wildcard: false,
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
  ],
  providers: [UserEventsService, UserRegisteredListeners],
  exports: [UserEventsService],
})
export class EventsModule {}
