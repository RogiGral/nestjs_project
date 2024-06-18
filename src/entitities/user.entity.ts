import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'InvoiceEntity' }] })
  invoices: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
