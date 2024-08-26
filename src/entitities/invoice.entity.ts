import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { LineItem } from './lineItem.entity';
import { Company } from './company.entity';
import { Customer } from './customer.entity';

@Schema()
export class InvoiceEntity extends Document {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  finalAmount: number;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  consumer: Customer;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  company: Company;

  @Prop({ type: [MongooseSchema.Types.Mixed], required: true })
  lineItems: LineItem[];

  @Prop({ required: true, unique: true })
  invoiceNumber: number;
}

export const InvoiceSchema = SchemaFactory.createForClass(InvoiceEntity);