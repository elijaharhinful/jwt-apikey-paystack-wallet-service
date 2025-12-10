import { IsNumber, Min, IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({
    description: 'Amount to deposit in kobo (100 kobo = 1 Naira)',
    example: 500000,
    minimum: 10000,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsInt({ message: 'Amount must be an integer (no decimals)' })
  @IsPositive({ message: 'Amount must be positive' })
  @Min(10000, { message: 'Minimum deposit amount is 10000 kobo (100 Naira)' })
  amount: number;
}
