import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class InvoiceEntity extends Document {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, required: true })
  userId: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(InvoiceEntity);