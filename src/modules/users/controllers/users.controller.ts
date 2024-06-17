import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpException,
  Patch,
  UsePipes,
  ValidationPipe,
  Delete,
  ForbiddenException,
  Req,
  UseGuards,
  HttpStatus,
  NotFoundException
} from '@nestjs/common';
import mongoose from 'mongoose';
import { UsersService } from '../services';
import { UserDto } from '../dto';
import { ClaimsGuard, JwtAuthGuard } from '../../../common/guards';
import { Claims } from '../../../common/decorators';
import { Claims as RequiredClaims } from '../../../common/consts/claims';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post("/create")
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_USER_CREATE)
  async create(@Body() createUserDto: UserDto) {
    const findUser = await this.usersService.findByUsername(createUserDto.username);
    if (findUser) {
      throw new HttpException(`User with username ${createUserDto.username} already exists`, HttpStatus.FOUND);
    }
    if (createUserDto.claims && !this.validateClaims(createUserDto.claims)) {
      throw new HttpException("Invalid claims", HttpStatus.BAD_REQUEST)
    }
    return this.usersService.create(createUserDto);
  }

  @Post("/register")
  async register(@Body() createUserDto: UserDto) {
    const findUser = await this.usersService.findByUsername(createUserDto.username);
    if (findUser) {
      throw new HttpException(`User with username ${createUserDto.username} already exists`, HttpStatus.FOUND);
    }
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_USER_READ)
  async findAll() {
    const users = await this.usersService.findAll();
    return users;
  }

  @Get('/status')
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_USER_STATUS)
  async checkStatus(@Req() request: any) {
    const findUser = await this.usersService.findByUsername(request.user._doc.username);
    if (!findUser) throw new NotFoundException(`User with username '${request.user._doc.username}' not found!`);
    return findUser;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_USER_READ)
  async findOne(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    const findUser = await this.usersService.findOne(id);
    if (!findUser) throw new NotFoundException(`User with id '${id}' not found!`);
    return findUser;
  }

  @Get(':username')
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_USER_READ)
  async findOneByUsername(@Param('username') username: string) {
    const findUser = await this.usersService.findByUsername(username);
    if (!findUser) throw new NotFoundException(`User with username '${username}' not found!`);
    return findUser;
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_USER_UPDATE)
  async update(@Param('id') id: string, @Body() updateUserDto: UserDto) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_USER_DELETE)
  async remove(@Param('id') id: string, @Req() request: any) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    if (request.user._doc._id == id) {
      throw new ForbiddenException("Trying to delete currently logged-in user")
    }
    return await this.usersService.remove(id);
  }

  @Patch(':id/claims/assign')
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_USER_UPDATE)
  async addClaims(@Param('id') id: string, @Body('claims') claims: string[]) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    if (claims && !this.validateClaims(claims)) {
      throw new HttpException("Invalid claims", HttpStatus.BAD_REQUEST)
    }
    const findUser = await this.usersService.findOne(id);
    if (!findUser) throw new NotFoundException(`User with id '${id}' not found!`);

    findUser.claims = [...new Set([...findUser.claims, ...claims])];

    return await this.usersService.assignClaims(findUser);
  }

  @Patch(':id/claims/remove')
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_USER_UPDATE)
  async removeClaims(@Param('id') id: string, @Body('claims') claims: string[]) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    if (claims && !this.validateClaims(claims)) {
      throw new HttpException("Invalid claims", HttpStatus.BAD_REQUEST)
    }
    const findUser = await this.usersService.findOne(id);
    if (!findUser) throw new NotFoundException(`User with id '${id}' not found!`);

    findUser.claims = findUser.claims.filter(claim => !claims.includes(claim));

    return await this.usersService.assignClaims(findUser);
  }


  validateClaims(claims: string[]): boolean {
    const validClaims = new Set(Object.values(RequiredClaims));

    if (!Array.isArray(claims)) {
      return false;
    }

    return !claims.some(claim => typeof claim !== 'string' || !validClaims.has(claim));
  }
}
