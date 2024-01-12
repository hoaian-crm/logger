import { Global, Module } from '@nestjs/common';
import { RedisDb, RedisModule } from '@hoaian-crm/redis-client';
import { MatterMostModule } from '../matttermost/mattermost.module';
import { LoggerService } from './logger.service';

@Global()
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
export class LoggerModule { }
