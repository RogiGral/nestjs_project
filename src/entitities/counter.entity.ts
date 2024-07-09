import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Counter extends Document {
    @Prop({ required: true })
    sequenceValue: number;

    @Prop({ required: true, unique: true })
    key: string;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);