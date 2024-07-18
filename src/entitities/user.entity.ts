import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Types } from 'mongoose';

@Schema()
export class UserEntity {
  @Prop({ unique: true, required: true })
  @IsString()
  @MinLength(3)
  username: string;

  @Prop({ unique: true, required: true })
  @IsEmail()
  email: string;

  @Prop({ required: true })
  @MinLength(6)
  password: string;

  @Prop({ required: true })
  companyName: string;

  @Prop({ type: [String], required: true })
  claims: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'InvoiceEntity' }] })
  invoices: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
