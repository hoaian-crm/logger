import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RedisService } from '@relationc/redis-client';
import { Messages } from '../../config/messages';
import { MattermostService } from '../matttermost/mattermost.service';
import { QueryFailedError } from 'typeorm';
import { IMessage, Response } from '@relationc/prototypes';
import { ValidationError } from 'class-validator';

@Injectable()
export class LoggerService {
  constructor(
    private redisService: RedisService,
    private mattermostService: MattermostService,
  ) { }

  async getMessage(key: string) {
    const message: IMessage | undefined = await this.redisService.get(key);
    if (!message) {
      return Messages.unknownError
    };
    return message;
  }

  async handleErrors(errors: ValidationError[]) {
    Response.badRequestThrow(await Promise.all(
      errors.map(async (error) => {
        return await this.handleError(error);
      }),
    ));
  }

  async handleError(
    error: IMessage | Error | QueryFailedError | ValidationError,
    metadata?: { field: string },
  ) {

    console.error(error);

    if (error instanceof QueryFailedError) {
      await this.handleQueryFailed(error, metadata);
    }

    if (error instanceof ValidationError) {
      return await this.handleValidationError(error);
    }

    if ((error as IMessage).code !== undefined) {
      await this.handleDefaultMessage((error as IMessage), metadata);
    }

    await this.handleUncatchMessage(error);
  }

  async handleDefaultMessage(error: IMessage, metadata: object = {}) {
    const message = await this.getMessage(error.code + '');
    if (message.code === 0) {
      this.mattermostService.sendUnknownMessage(error)
    }
    Response.badRequestThrow({ ...message, ...metadata });
  }

  async handleQueryFailed(error: QueryFailedError<any>, metadata: object = {}) {
    const message = await this.getMessage(error.driverError.code);
    if (!message || message.code === 0) {
      this.mattermostService.sendUnknownMessage({
        type: "Postgres dirver",
        [error.driverError.code]: error.message
      })
    }
    Response.badRequestThrow({ ...message, ...metadata });
  }

  async handleValidationError(error: ValidationError) {
    if (!error.constraints && error.children) {
      return this.handleValidationError(error.children[0])
    }
    const key = Object.keys(error.constraints)[0];
    const message = await this.getMessage(key);
    if (message.code === 0) this.handleUnknowMessage(error.constraints);
    return {
      code: message.code,
      description: message.description,
      field: error.property,
      target: error.target
    };
  }

  async handleUncatchMessage(error: any) {
    await this.mattermostService.unCatchError(error);
    throw new InternalServerErrorException((error as Error).message);
  }

  async handleUnknowMessage(message: any) {
    // TODO: Handle send to mattermost web hook
    await this.mattermostService.sendUnknownMessage(message);
  }

  async sync() {
    await Promise.all(
      Object.keys(Messages).map(async (message) => {
        return await this.redisService.set(message, Messages[message]);
      }),
    );
    await Promise.all(
      Object.keys(Messages).map(async (message) => {
        return await this.redisService.set(Messages[message].code + "", Messages[message]);
      }),
    );
  }
}
