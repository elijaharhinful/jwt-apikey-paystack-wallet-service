import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({
    description: 'Amount to deposit in Cedis',
    example: 5000,
    minimum: 100,
  })
  @IsNumber()
  @Min(100, { message: 'Minimum deposit amount is 100' })
  amount: number;
}
