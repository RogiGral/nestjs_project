import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class MessageEntity extends Document {
    @Prop({ required: true })
    from: string;

    @Prop({ required: true })
    content: string;

    @Prop({ type: Date, default: Date.now })
    timestamp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(MessageEntity);