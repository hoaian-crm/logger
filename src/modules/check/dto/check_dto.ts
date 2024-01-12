import { IsIP, IsString } from 'class-validator';

export class CheckDto {
  @IsIP()
  value: string;
}
