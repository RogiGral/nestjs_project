import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Address } from './address.entity';

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

export const ConsumerSchema = SchemaFactory.createForClass(Consumer);