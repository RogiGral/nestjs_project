import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserEntity } from "src/entity";
import { CreateUserDto, UpdateUserDto } from "./dto";
import { GeneratePassword } from "src/common/utility";


@Injectable()
export class UsersService {

  saltRounds: number = 10;

  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserEntity>
  ) { }

  async create(createUserDto: CreateUserDto) {
    const saltedPassword = await GeneratePassword(createUserDto.password, this.saltRounds);
    createUserDto.password = saltedPassword;
    const newUser = new this.userModel(createUserDto);
    return await newUser.save();
  }

  async findAll() {
    return await this.userModel.find();
  }

  async findOne(id: string) {
    return await this.userModel.findById(id);
  }

  async findByUsername(username: string) {
    return await this.userModel.findOne({ username });
  }
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    return await this.userModel.findByIdAndDelete(id)
  }
}
