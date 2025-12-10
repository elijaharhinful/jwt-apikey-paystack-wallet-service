import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferDto {
  @ApiProperty({ description: 'The wallet number of the recipient' })
  @IsString()
  @IsNotEmpty()
  wallet_number: string;

  @ApiProperty({
    description: 'The amount to transfer in kobo (100 kobo = 1 Naira)',
    minimum: 100,
    example: 50000,
  })
  @IsNumber()
  @IsInt({
    message:
      'Transfer amount must be a whole number (kobo). No decimals allowed.',
  })
  @IsPositive({ message: 'Transfer amount must be positive' })
  @Min(100, { message: 'Minimum transfer amount is 100 kobo (1 Naira)' })
  amount: number;
}
