import { IsAlphanumeric } from 'class-validator';

export class CheckDto {
  @IsAlphanumeric()
  value: string;
}
