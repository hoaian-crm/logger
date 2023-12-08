import { Body, Controller, Get, Post } from '@nestjs/common';
import { Response } from 'crm-prototypes';
import { Messages } from '../../config/messages';
import { LoggerService } from '../logger/logger.service';
import { CheckDto } from './dto/check_dto';

@Controller('check')
export class CheckController {
  constructor(private loggerService: LoggerService) {}

  @Get('/400')
  async check400() {
    Response.badRequestThrow(Messages.unknownError);
  }

  @Get('/500')
  async check500() {
    try {
      throw new Error('ngu ngoc');
    } catch (error) {
      await this.loggerService.handleError(error);
    }
  }

  @Post('/dto')
  async checkDto(@Body() data: CheckDto) {
    return data;
  }
}
