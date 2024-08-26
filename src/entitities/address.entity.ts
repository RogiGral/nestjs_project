import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

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

export const AddressSchema = SchemaFactory.createForClass(Address);