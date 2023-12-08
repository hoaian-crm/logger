import { Module } from '@nestjs/common';
import { RedisDb, RedisModule } from 'crm-redis-client';
import { MatterMostModule } from '../matttermost/mattermost.module';
import { LoggerService } from './logger.service';

@Module({
  imports: [
    RedisModule.register({
      database: RedisDb.Logger,
    }),
    MatterMostModule,
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
