import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Types, Document, Schema as MongooseSchema } from 'mongoose';
import { Customer } from './customer.entity';

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

  @Prop({ required: true })
  companyName: string;

  @Prop({ type: [String], required: true })
  claims: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'InvoiceEntity' }] })
  invoices: Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  customer: Customer;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
