import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'BYuZE^Jf9xItEZPO',
      appSecret: 'y7ow3TNxVV73LbGj0JHzTid!jz!Rl&YgKKebYB4Ujm^2l',
      serviceId: 'MMS',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
