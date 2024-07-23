import { PartialType } from "@nestjs/swagger";

export class CreatePaymentMethodDto { }
export class UpdatePaymentMethodDto extends PartialType(CreatePaymentMethodDto) { }
