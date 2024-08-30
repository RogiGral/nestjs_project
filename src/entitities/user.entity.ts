import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Types, Schema as MongooseSchema } from 'mongoose';
import { Customer } from './customer.entity';
import { Company } from './company.entity';

@Schema()
export class UserEntity {
  @Prop({ unique: true, required: true })
  @IsString()
  @MinLength(3)
  name: string;

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

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  company: Company;

  @Prop({ type: [String], required: true })
  claims: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'InvoiceEntity' }] })
  invoices: Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  customer: Customer;

  @Prop({ type: Boolean, default: false })
  online: boolean;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'MessageEntity' }] })
  messages: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
