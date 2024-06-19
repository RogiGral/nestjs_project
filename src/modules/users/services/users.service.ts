import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvoiceEntity, UserEntity } from '../../../entitities';
import { CreateUserDto, RegisterUserDto, UpdateUserDto, UserDto } from '../dto';
import { GeneratePassword } from '../../../common/utilities';
export const EXCLUDE_FIELDS = '-__v -password';

@Injectable()
export class UsersService {
  saltRounds: number = 10;

  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserEntity>,
    @InjectModel(InvoiceEntity.name) private invoiceModel: Model<InvoiceEntity>
  ) { }

  async create(createUserDto: CreateUserDto | RegisterUserDto) {
    const saltedPassword = await GeneratePassword(
      createUserDto.password,
      this.saltRounds,
    );

    if (createUserDto instanceof RegisterUserDto) {
      createUserDto.claims = ['CAN_ACCESS_USER_STATUS'];
    }

    createUserDto.password = saltedPassword;
    const newUser = new this.userModel(createUserDto);
    const saveUSer = await newUser.save();
    console.log(saveUSer)
  }

  async findAll() {
    const findUsers = await this.userModel.find().populate({
      path: 'invoices',
      model: this.invoiceModel,
    }).select(EXCLUDE_FIELDS).exec();
    return { findUsers };
  }

  async findOne(id: string) {
    const findUser = await this.userModel.findOne({ _id: id }).populate({
      path: 'invoices',
      model: this.invoiceModel,
    }).select(EXCLUDE_FIELDS).exec();
    return { findUser };
  }

  async findByUsername(username: string) {
    const findUser = await this.userModel.findOne({ username }).populate({
      path: 'invoices',
      model: this.invoiceModel,
    }).select(EXCLUDE_FIELDS).exec();
    return { findUser };
  }
  async update(id: string, updateUserDto: UpdateUserDto) {
    const findUser = await this.userModel.findOne({ _id: id }).exec();

    if (!findUser) throw new NotFoundException(`Failed to update user! User with id '${id}' not found.`);

    const saltedPassword = await GeneratePassword(
      updateUserDto.password,
      this.saltRounds,
    );

    updateUserDto.password = saltedPassword;
    Object.assign(findUser, updateUserDto);
    await findUser.save();
  }

  async assignClaims(user: UserDto) {
    const findUser = await this.userModel.findOne({ username: user.username }).exec();

    if (!findUser) throw new NotFoundException(`Failed to update user! User with username '${user.username}' not found.`);

    Object.assign(findUser, user);
    await findUser.save();
  }

  async remove(id: string): Promise<UserEntity> {
    const findUser = await this.userModel.findOneAndDelete({ _id: id }).select(EXCLUDE_FIELDS).exec();
    if (!findUser) throw new NotFoundException(`Failed to delete User! User with id '${id}' not found.`);
    return findUser;
  }

  async addInvoiceToUser(userId: string, invoiceId: string): Promise<UserEntity> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $push: { invoices: invoiceId } },
      { new: true, useFindAndModify: false }
    ).select(EXCLUDE_FIELDS).exec();
  }
}
