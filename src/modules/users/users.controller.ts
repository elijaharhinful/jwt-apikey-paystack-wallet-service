import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDocs, CreateUserDocs, FindUserDocs } from './docs/users.swagger';

@Controller('users')
@UserDocs()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Minimal exposure for debugging or admin

  @Post()
  @CreateUserDocs()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  @FindUserDocs()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
