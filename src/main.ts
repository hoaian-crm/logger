import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Response } from 'crm-prototypes';
import { AppModule } from './app.module';
import { LoggerService } from './modules/logger/logger.service';

export const sync = async () => {
  const app = await NestFactory.create(AppModule);

  const service = app.get<LoggerService>(LoggerService);
  const validation = new ValidationPipe({
    whitelist: true,
    exceptionFactory: async (errors) => {
      const result = await service.handleErrors(errors);
      Response.badRequestThrow(result);
    },

    stopAtFirstError: true,
  });
  app.useGlobalPipes(validation);

  await app.init();

  await service.sync();
  console.log('Sync message done');
  // process.exit();
  app.listen(process.env.APP_PORT);
};

sync();
