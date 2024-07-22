import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Company {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    tin_number: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);