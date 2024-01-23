import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Response } from '@relationc/prototypes';
import { AppModule } from './app.module';
import { LoggerService } from './modules/logger/logger.service';
import { ErrorsInterceptor } from './modules/logger/interceptors';

export const sync = async () => {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("/api/v1")

  const service = app.get<LoggerService>(LoggerService);
  const validation = new ValidationPipe({
    whitelist: true,
    exceptionFactory: async (errors) => {
      throw errors
    },

    stopAtFirstError: true,
  });
  app.useGlobalPipes(validation);
  app.useGlobalInterceptors(new ErrorsInterceptor(service));

  await app.init();

  await service.sync();
  console.log('Sync message done');
  process.exit();
  app.listen(process.env.APP_PORT);
};

sync();
