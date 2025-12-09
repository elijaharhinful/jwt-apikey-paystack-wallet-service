import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({
    description: 'A descriptive name for the API key',
    example: 'mobile-app-service',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'List of permissions allowed for this key',
    isArray: true,
    enum: ['deposit', 'transfer', 'read'],
    example: ['deposit', 'read', 'transfer'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsIn(['deposit', 'transfer', 'read'], { each: true })
  @ArrayMinSize(1)
  permissions: string[];

  @ApiProperty({
    description: 'Expiration duration for the API key',
    enum: ['1H', '1D', '1M', '1Y'],
    example: '1M',
  })
  @IsString()
  @IsIn(['1H', '1D', '1M', '1Y'])
  expiry: string;
}
