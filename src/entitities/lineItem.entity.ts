import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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

export const LineItemSchema = SchemaFactory.createForClass(LineItem);
