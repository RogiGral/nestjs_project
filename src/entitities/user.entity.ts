import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserEntity {
  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], required: true })
  claims: string[];
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
