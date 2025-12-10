import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferDto {
  @ApiProperty({ description: 'The wallet ID of the recipient' })
  @IsString()
  @IsNotEmpty()
  wallet_number: string;

  @ApiProperty({
    description: 'The amount to transfer in kobo (100 kobo = 1 Naira)',
    minimum: 100,
    example: 50000,
  })
  @IsNumber()
  @Min(100, { message: 'Minimum transfer amount is 100 kobo (1 Naira)' })
  amount: number;
}
