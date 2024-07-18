import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Address {
  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  line1: string;

  @Prop()
  line2: string;

  @Prop({ required: true })
  postal_code: string;

  @Prop({ required: true })
  state: string;
}

@Schema()
export class Consumer {
  @Prop({ required: true })
  email: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  address: Address;

  @Prop({ required: true })
  name: string;

  @Prop()
  phoneNumber: string;
}

@Schema()
export class Company {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  tin_number: string;
}

@Schema()
export class LineItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  amount_total: number;

  @Prop({ required: true })
  amount_unit: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true, enum: ['pln', 'usd'] })
  currency: string;

  @Prop({ required: true, enum: ['0%', '20%'] })
  tax_value: string;
}

@Schema()
export class InvoiceEntity extends Document {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  finalAmount: number;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  consumer: Consumer;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  company: Company;

  @Prop({ type: [MongooseSchema.Types.Mixed], required: true })
  lineItems: LineItem[];

  @Prop({ required: true, unique: true })
  invoiceNumber: number;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
export const ConsumerSchema = SchemaFactory.createForClass(Consumer);
export const CompanySchema = SchemaFactory.createForClass(Company);
export const LineItemSchema = SchemaFactory.createForClass(LineItem);
export const InvoiceSchema = SchemaFactory.createForClass(InvoiceEntity);