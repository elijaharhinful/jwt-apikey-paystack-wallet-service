import { IsNumber, Min, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({
    description: 'Amount to deposit in kobo (100 kobo = 1 Naira)',
    example: 500000,
    minimum: 10000,
  })
  @IsNumber()
  @IsInt({ message: 'Amount must be an integer (kobo)' })
  @Min(10000, { message: 'Minimum deposit amount is 10000 kobo (100 Naira)' })
  amount: number;
}
