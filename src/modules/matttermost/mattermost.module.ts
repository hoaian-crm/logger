import { Module } from '@nestjs/common';
import { MattermostService } from './mattermost.service';

@Module({
  providers: [MattermostService],
  exports: [MattermostService],
})
export class MatterMostModule {}
