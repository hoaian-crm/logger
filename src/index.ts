import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Response } from '@relationc/prototypes';
import { AppModule } from './app.module';
import { LoggerService } from './modules/logger/logger.service';
import { ErrorsInterceptor } from './modules/logger/interceptors';

export const configLogger = async (app?: INestApplication) => {
  if (!app) {
    app = await NestFactory.create(AppModule);
    await app.init();
  }

  const service = app.get<LoggerService>(LoggerService);

  const validation = new ValidationPipe({
    whitelist: true,
    exceptionFactory: async (errors) => {
      throw errors
    },

    stopAtFirstError: true,
  });
  app.useGlobalInterceptors(new ErrorsInterceptor(service));
  return validation;
};

export * from './modules/logger/logger.module';
export * from './modules/logger/logger.service';
export * from './config/messages';

