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
import { createResponse } from 'src/common/utilities';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

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
    const user = await this.usersService.create(createUserDto);
    return createResponse({ body: user, statusCode: HttpStatus.CREATED });
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
    const user = await this.usersService.create(registerUserDto);

    return createResponse({ body: user, statusCode: HttpStatus.CREATED });
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
    return createResponse({
      body: {
        findUsers,
        nextCursor,
        prevCursor,
        totalResults,
      },
      statusCode: HttpStatus.OK
    });
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
    return createResponse({ body: findUser, statusCode: HttpStatus.OK });
  }

  @Get('/check-update-status')
  @UseGuards(JwtAuthGuard)
  async checkUpdateStatus(@Req() request: any) {
    const { findUser } = await this.usersService.findByUsername(request.user._doc.username);

    if (!findUser) {
      throw new NotFoundException(`User with username '${request.user._doc.username}' not found!`);
    }

    const requiredFields = {
      user: ['name', 'username', 'email', 'companyName'],
      customer: ['id', 'description', 'phone'],
      address: ['city', 'country', 'line1', 'postal_code']
    };

    const { customer } = findUser;
    const { address } = customer;

    const missingFields = [
      ...requiredFields.user.filter(field => !findUser[field]),
      ...requiredFields.customer.filter(field => !customer[field]),
      ...requiredFields.address.filter(field => !address[field])
    ];

    return createResponse({ body: missingFields, statusCode: HttpStatus.OK });
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
    return createResponse({ body: findUser, statusCode: HttpStatus.OK });
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
    return createResponse({ body: findUser, statusCode: HttpStatus.OK });
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
    const user = await this.usersService.update(id, updateUserDto);
    return createResponse({ body: user, statusCode: HttpStatus.OK });
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
    const user = await this.usersService.remove(id);
    return createResponse({ body: user, statusCode: HttpStatus.OK });

  }

  @Patch(':id/claims/assign')
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_USER_UPDATE)
  async assignClaims(@Param('id') id: string, @Body('claims') claims: string[]) {
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

    const user = await this.usersService.assignClaims(findUser);
    return createResponse({ body: user, statusCode: HttpStatus.CREATED });
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

    const user = await this.usersService.assignClaims(findUser);

    return createResponse({ body: user, statusCode: HttpStatus.CREATED });
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
