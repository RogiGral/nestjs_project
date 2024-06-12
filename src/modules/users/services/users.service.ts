import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEntity } from '../../../entity';
import { UserDto } from '../dto';
import { GeneratePassword } from '../../../common/utility';

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
    createUserDto.password = saltedPassword;
    const newUser = new this.userModel(createUserDto);
    return await newUser.save();
  }

  async findAll() {
    const data = await this.userModel.find().select(EXCLUDE_FIELDS).exec();
    return { data };
  }

  async findOne(id: string) {
    const findUser = await this.userModel.findOne({ id }).select(EXCLUDE_FIELDS).exec();
    if (!findUser) throw new NotFoundException(`User with id '${id}' not found!`);
    return findUser;
  }

  async findByUsername(username: string) {
    const findUser = await this.userModel.findOne({ username }).select(EXCLUDE_FIELDS).exec();
    if (!findUser) throw new NotFoundException(`User with username '${username}' not found!`);
    return findUser;
  }
  async update(id: string, updateUserDto: UserDto) {
    const findUser = await this.userModel.findOne({ id }).exec();

    if (!findUser) throw new NotFoundException(`Failed to update user! User with id '${id}' not found.`);

    Object.assign(findUser, updateUserDto);
    const updateUser = await findUser.save();
    return updateUser;
  }

  async remove(id: string) {
    const doc = await this.userModel.findOneAndDelete({ id }).select(EXCLUDE_FIELDS).exec();
    if (!doc) throw new NotFoundException(`Failed to delete User! User with id '${id}' not found.`);
    return doc;
  }
}
