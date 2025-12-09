import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferDto {
  @ApiProperty({ description: 'The wallet ID of the recipient' })
  @IsString()
  @IsNotEmpty()
  wallet_number: string;

  @ApiProperty({ description: 'The amount to transfer', minimum: 1 })
  @IsNumber()
  @Min(1)
  amount: number;
}
