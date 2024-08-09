import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Company {
    @Prop({ required: true })
    type: string;

    @Prop({ required: true })
    value: string;

    @Prop({ required: true })
    name: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);