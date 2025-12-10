import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDocs, FindUserDocs } from './docs/users.swagger';

@Controller('users')
@UserDocs()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @FindUserDocs()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
