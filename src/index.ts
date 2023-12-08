import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Response } from 'crm-prototypes';
import { AppModule } from './app.module';
import { LoggerService } from './modules/logger/logger.service';

export const configLogger = async () => {
  const app = await NestFactory.create(AppModule);
  await app.init();

  const service = app.get<LoggerService>(LoggerService);

  const validation = new ValidationPipe({
    whitelist: true,
    exceptionFactory: async (errors) => {
      const result = await service.handleErrors(errors);
      Response.badRequestThrow(result);
    },

    stopAtFirstError: true,
  });
  return validation;
};

export * from './modules/logger/logger.module';
export * from './modules/logger/logger.service';

