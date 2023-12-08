import {
  Injectable,
  InternalServerErrorException,
  ValidationError,
} from '@nestjs/common';
import { IMessage, Response } from 'crm-prototypes';
import { RedisService } from 'crm-redis-client';
import { Messages } from '../../config/messages';
import { MattermostService } from '../matttermost/mattermost.service';

@Injectable()
export class LoggerService {
  constructor(
    private redisService: RedisService,
    private mattermostService: MattermostService,
  ) {}

  async getMessage(key: string) {
    const message: IMessage | undefined = await this.redisService.get(key);
    if (!message) return Messages.unknownError;
    return message;
  }

  async handleErrors(errors: ValidationError[]): Promise<Array<IMessage>> {
    return await Promise.all(
      errors.map(async (error) => {
        const key = Object.keys(error.constraints)[0];
        const message = await this.getMessage(key);
        if (message.code === 0) {
          // TODO: Handle send to mattermost web hook
          await this.mattermostService.sendUnknownMessage(error.constraints);
        }
        return {
          code: message.code,
          description: message.description,
          field: error.property,
        };
      }),
    );
  }

  async handleError(error: IMessage | Error) {
    if ((error as IMessage).code) Response.badRequestThrow(error as IMessage);
    await this.mattermostService.unCatchError(error);
    throw new InternalServerErrorException((error as Error).message);
  }

  async sync() {
    await Promise.all(
      Object.keys(Messages).map(async (message) => {
        return await this.redisService.set(message, Messages[message]);
      }),
    );
  }
}
