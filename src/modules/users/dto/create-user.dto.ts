import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'test@example.com' })
  email: string;

  @ApiProperty({ example: 'google_id_123', required: false })
  googleId?: string;
}
