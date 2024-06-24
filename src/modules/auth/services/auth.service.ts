import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ValidatePassword } from "../../../common/utilities";
import { UsersService } from "../../../modules/users";
import { LoginPayloadDto } from "../dto";
import { UserEntity } from "../../../entitities";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    @InjectModel(UserEntity.name) private userModel: Model<UserEntity>,
  ) { }

  async validateUser({ username, password }: LoginPayloadDto): Promise<any> {
    const userFromDB = await this.userModel.findOne({ username });
    if (!userFromDB) return null;
    if (ValidatePassword(password, userFromDB.password)) {
      const { password, ...user } = userFromDB;
      return { user };
    }
    return null;
  }

  async login({ username, password }: LoginPayloadDto): Promise<any> {
    const userFromDB = await this.userModel.findOne({ username });
    if (!userFromDB) return null;
    if (ValidatePassword(password, userFromDB.password)) {
      const { password, ...user } = userFromDB;
      return {
        accessToken: this.jwtService.sign(user, { expiresIn: '8h' }),
        refreshToken: this.jwtService.sign(user, { expiresIn: '1d' }),
      };
    }
    return null;
  }

  async refreshToken({ username }: LoginPayloadDto): Promise<any> {
    const userFromDB = await this.userModel.findOne({ username });
    if (userFromDB) {
      const { password, ...user } = userFromDB;
      return {
        accessToken: this.jwtService.sign(user),
      };
    }
    return null;
  }
}
