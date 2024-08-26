import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvoiceEntity, UserEntity } from '../../../entitities';
import { CreateUserDto, RegisterUserDto, UpdateUserDto, UserDto } from '../dto';
import { GeneratePassword } from '../../../common/utilities';
import Stripe from 'stripe';

export const EXCLUDE_FIELDS = '-__v -password';

@Injectable()
export class UsersService {
  private saltRounds: number = 10;

  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserEntity>,
    @InjectModel(InvoiceEntity.name) private invoiceModel: Model<InvoiceEntity>,
    @Inject('STRIPE') private readonly stripe: Stripe,
  ) { }

  async create(createUserDto: CreateUserDto | RegisterUserDto) {
    const saltedPassword = await GeneratePassword(
      createUserDto.password,
      this.saltRounds,
    );

    let customer: any;

    if (createUserDto instanceof RegisterUserDto) {
      createUserDto.claims = ['CAN_ACCESS_USER_STATUS'];
    }

    createUserDto.password = saltedPassword;

    //check if user exist
    const userExist = await this.userModel.findOne({
      name: createUserDto.name,
    });

    if (userExist) {
      throw new ForbiddenException(
        `Failed to create user! User with name '${createUserDto.name}' already exist.`,
      );
    }

    //create stripe customer
    try {
      customer = await this.stripe.customers.create({
        email: createUserDto.email,
        name: createUserDto.name,
        address: createUserDto.customer.address
      });
    } catch (error) {
      throw new ForbiddenException(
        `Failed to create customer for user with email '${createUserDto.email}'`,
      );
    }

    const newUser = new this.userModel(createUserDto);

    newUser.customer.id = customer.id;

    const saveUser = await newUser.save();
    return saveUser;
  }


  async findAll(
    nextInputCursor: string,
    prevInputCursor: string,
    limit: number,
  ) {
    const query: any = {};
    let sort: number = 1;
    if (nextInputCursor && prevInputCursor) {
      throw new ForbiddenException(
        'Cannot pass prev and next input cursor in same querry',
      );
    }
    if (nextInputCursor) {
      query._id = { $gt: nextInputCursor };
      sort = 1;
    }
    if (prevInputCursor) {
      query._id = { $lt: prevInputCursor };
      sort = -1;
    }
    const findUsers = await this.userModel
      .find(query, { password: 0 })
      .sort(sort == 1 ? { _id: 1 } : { _id: -1 })
      .populate({
        path: 'invoices',
        model: this.invoiceModel,
      })
      .limit(Number(limit) + 1);

    if (findUsers.length === 0) {
      throw new NotFoundException('Users not found!');
    }

    const hasNextPage = findUsers.length > limit;
    const hasPrevPage = !!prevInputCursor || (hasNextPage && !!nextInputCursor);

    const usersToReturn = hasNextPage ? findUsers.slice(0, -1) : findUsers;

    let nextCursor = hasNextPage
      ? usersToReturn[usersToReturn.length - 1]._id
      : null;
    let prevCursor = hasPrevPage ? usersToReturn[0]._id : null;

    if (sort === -1) {
      usersToReturn.reverse();
      [nextCursor, prevCursor] = [prevCursor, nextCursor];
    }

    return {
      findUsers: usersToReturn,
      totalResults: usersToReturn.length,
      nextCursor,
      prevCursor,
    };
  }

  async findOne(id: string): Promise<any> {
    const findUser = await this.userModel
      .findOne({ _id: id }, { password: 0 })
      .populate({
        path: 'invoices',
        model: this.invoiceModel,
      });
    return { findUser };
  }

  async findByUsername(username: string) {
    const findUser = await this.userModel
      .findOne({ username }, { password: 0 })
      .populate({
        path: 'invoices',
        model: this.invoiceModel,
      });
    return { findUser };
  }
  async findByEmail(email: string) {
    const findUser = await this.userModel.findOne({ email }, { password: 0 });
    return { findUser };
  }
  async update(id: string, updateUserDto: UpdateUserDto) {
    const findUser = await this.userModel.findOne({ _id: id }, { password: 0 });
    const stripeCustomerId = findUser.customer.id;

    if (!findUser)
      throw new NotFoundException(
        `Failed to update user! User with id '${id}' not found.`,
      );

    if (updateUserDto.password) {
      const saltedPassword = await GeneratePassword(
        updateUserDto.password,
        this.saltRounds,
      );
      updateUserDto.password = saltedPassword;
    }

    Object.assign(findUser, updateUserDto);
    const user = await findUser.save();
    await this.stripe.customers.update(stripeCustomerId, {
      email: findUser.email,
      name: findUser.name,
      phone: findUser.customer.phone,
      address: {
        line1: findUser.customer.address.line1,
        line2: findUser.customer.address.line2,
        city: findUser.customer.address.city,
        postal_code: findUser.customer.address.postal_code,
        state: findUser.customer.address.state,
        country: findUser.customer.address.country,
      }
    });
    return user;
  }

  async assignClaims(user: UserDto) {
    const findUser = await this.userModel.findOne(
      { username: user.username },
      { password: 0 },
    );

    if (!findUser)
      throw new NotFoundException(
        `Failed to update user! User with username '${user.username}' not found.`,
      );

    Object.assign(findUser, user);
    return await findUser.save();
  }

  async remove(id: string): Promise<UserEntity> {
    const findUser = await this.userModel.findOneAndDelete(
      { _id: id },
      { password: 0 },
    );
    if (!findUser)
      throw new NotFoundException(
        `Failed to delete User! User with id '${id}' not found.`,
      );
    return findUser;
  }

  async addInvoiceToUser(
    userId: string,
    invoiceId: string,
  ): Promise<UserEntity> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $push: { invoices: invoiceId } },
      { new: true, useFindAndModify: false },
    );
  }
}
