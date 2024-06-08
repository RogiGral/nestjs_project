import { Controller, Post, Body, Get, Param, HttpException, Patch, UsePipes, ValidationPipe, Delete } from "@nestjs/common";
import mongoose from "mongoose";
import { CreateUserDto, UpdateUserDto } from "./dto";
import { UsersService } from "./users.service";


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', 400);
    }
    const findUser = await this.usersService.findOne(+id);
    if (!findUser) {
      throw new HttpException('User not found', 404);
    }
    return findUser;
  }

  @Get(':username')
  async findOneByUsername(@Param('username') username: string) {
    const findUser = await this.usersService.findByUsername(username)
    if (!findUser) {
      throw new HttpException('User not found', 404);
    }
    return findUser;
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', 400);
    }
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', 400);
    }
    return await this.usersService.remove(id);
  }
}
