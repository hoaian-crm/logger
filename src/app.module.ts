import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CheckController } from './modules/check/check.controller';
import { LoggerModule } from './modules/logger/logger.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
  ],
  controllers: [CheckController],
})
export class AppModule { }
