import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEntity } from '../../../entitities';
import { UserDto } from '../dto';
import { GeneratePassword } from '../../../common/utilities';
import { Claims as RequiredClaims } from '../../../common/consts/claims';
export const EXCLUDE_FIELDS = '-__v -password';

@Injectable()
export class UsersService {
  saltRounds: number = 10;

  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserEntity>,
  ) { }

  async create(createUserDto: UserDto) {
    const saltedPassword = await GeneratePassword(
      createUserDto.password,
      this.saltRounds,
    );

    if (createUserDto.claims == undefined) {
      createUserDto.claims = ['CAN_ACCESS_USER_STATUS'];
    }

    createUserDto.password = saltedPassword;
    const newUser = new this.userModel(createUserDto);
    return await newUser.save();
  }

  async findAll() {
    const data = await this.userModel.find().select(EXCLUDE_FIELDS).exec();
    return { data };
  }

  async findOne(id: string) {
    const findUser = await this.userModel.findOne({ _id: id }).select(EXCLUDE_FIELDS).exec();
    return findUser;
  }

  async findByUsername(username: string) {
    const findUser = await this.userModel.findOne({ username }).select(EXCLUDE_FIELDS).exec();
    return findUser;
  }
  async update(id: string, updateUserDto: UserDto) {
    const findUser = await this.userModel.findOne({ _id: id }).exec();

    if (!findUser) throw new NotFoundException(`Failed to update user! User with id '${id}' not found.`);

    const saltedPassword = await GeneratePassword(
      updateUserDto.password,
      this.saltRounds,
    );

    updateUserDto.password = saltedPassword;
    Object.assign(findUser, updateUserDto);
    const updateUser = await findUser.save();
    return updateUser;
  }

  async assignClaims(user: UserDto) {
    const findUser = await this.userModel.findOne({ username: user.username }).exec();

    if (!findUser) throw new NotFoundException(`Failed to update user! User with username '${user.username}' not found.`);

    Object.assign(findUser, user);
    const updateUser = await findUser.save();
    return updateUser;
  }

  async remove(id: string) {
    const findUser = await this.userModel.findOneAndDelete({ _id: id }).select(EXCLUDE_FIELDS).exec();
    if (!findUser) throw new NotFoundException(`Failed to delete User! User with id '${id}' not found.`);
    return findUser;
  }
}
