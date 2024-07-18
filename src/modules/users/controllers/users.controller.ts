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
  NotFoundException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { UsersService } from '../services';
import { CreateUserDto, RegisterUserDto, UpdateUserDto } from '../dto';
import { ClaimsGuard, JwtAuthGuard } from '../../../common/guards';
import { Claims } from '../../../common/decorators';
import { Claims as RequiredClaims } from '../../../common/consts/claims';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_USER_CREATE)
  async create(@Body() createUserDto: CreateUserDto) {
    const { findUser } = await this.usersService.findByUsername(
      createUserDto.username,
    );
    if (findUser) {
      throw new HttpException(
        `User with username ${createUserDto.username} already exists`,
        HttpStatus.FOUND,
      );
    }
    if (createUserDto.claims && !this.validateClaims(createUserDto.claims)) {
      throw new HttpException('Invalid claims', HttpStatus.BAD_REQUEST);
    }
    await this.usersService.create(createUserDto);
    return { message: 'User has been created', statusCode: HttpStatus.CREATED };
  }

  @Post('/register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    const { findUser } = await this.usersService.findByUsername(
      registerUserDto.username,
    );
    if (findUser) {
      throw new HttpException(
        `User with username ${registerUserDto.username} already exists`,
        HttpStatus.FOUND,
      );
    }
    await this.usersService.create(registerUserDto);

    return {
      message: 'User has been registered',
      statusCode: HttpStatus.CREATED,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_USER_READ)
  async findAll(@Req() request) {
    const { nextInputCursor, prevInputCursor, limitNumber = 2 } = request.query;
    const { findUsers, totalResults, prevCursor, nextCursor } =
      await this.usersService.findAll(
        nextInputCursor,
        prevInputCursor,
        limitNumber,
      );

    return {
      findUsers,
      status: HttpStatus.OK,
      nextCursor,
      prevCursor,
      totalResults,
    };
  }

  @Get('/status')
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_USER_STATUS)
  async checkStatus(@Req() request: any) {
    const { findUser } = await this.usersService.findByUsername(
      request.user._doc.username,
    );
    if (!findUser)
      throw new NotFoundException(
        `User with username '${request.user._doc.username}' not found!`,
      );
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
    const { findUser } = await this.usersService.findOne(id);
    if (!findUser)
      throw new NotFoundException(`User with id '${id}' not found!`);
    return findUser;
  }

  @Get(':username')
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_USER_READ)
  async findOneByUsername(@Param('username') username: string) {
    const { findUser } = await this.usersService.findByUsername(username);
    if (!findUser)
      throw new NotFoundException(
        `User with username '${username}' not found!`,
      );
    return findUser;
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_USER_UPDATE)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    await this.usersService.update(id, updateUserDto);
    return { message: 'User has been updated', statusCode: HttpStatus.CREATED };
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
      throw new ForbiddenException('Trying to delete currently logged-in user');
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
      throw new HttpException('Invalid claims', HttpStatus.BAD_REQUEST);
    }
    const { findUser } = await this.usersService.findOne(id);
    if (!findUser)
      throw new NotFoundException(`User with id '${id}' not found!`);

    findUser.claims = [...new Set([...findUser.claims, ...claims])];

    await this.usersService.assignClaims(findUser);
    return {
      message: `User claims: ${claims} has been updated`,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Patch(':id/claims/remove')
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_USER_UPDATE)
  async removeClaims(
    @Param('id') id: string,
    @Body('claims') claims: string[],
  ) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    if (claims && !this.validateClaims(claims)) {
      throw new HttpException('Invalid claims', HttpStatus.BAD_REQUEST);
    }
    const { findUser } = await this.usersService.findOne(id);
    if (!findUser)
      throw new NotFoundException(`User with id '${id}' not found!`);

    findUser.claims = findUser.claims.filter(
      (claim) => !claims.includes(claim),
    );

    await this.usersService.assignClaims(findUser);

    return {
      message: `User claims: ${claims} has been removed`,
      statusCode: HttpStatus.CREATED,
    };
  }

  validateClaims(claims: string[]): boolean {
    const validClaims = new Set(Object.values(RequiredClaims));

    if (!Array.isArray(claims)) {
      return false;
    }

    return !claims.some(
      (claim) => typeof claim !== 'string' || !validClaims.has(claim),
    );
  }
}
