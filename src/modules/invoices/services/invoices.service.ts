import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { InvoiceEntity } from '../../../entitities';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class InvoicesService {

  constructor(
    @InjectModel(InvoiceEntity.name) private invoiceModel: Model<InvoiceEntity>
  ) { }

  async create(createInvoiceDto: CreateInvoiceDto) {
    const createdInvoice = new this.invoiceModel(createInvoiceDto);
    return await createdInvoice.save()
  }

  async findAll() {
    const findInvoices = await this.invoiceModel.find().exec()
    return { findInvoices };
  }

  async findOne(id: number) {
    const findInvoice = await this.invoiceModel.findOne({ _id: id }).exec();
    return { findInvoice };
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
    const findInvoice = await this.invoiceModel.findOne({ _id: id }).exec();

    if (!findInvoice) throw new NotFoundException(`Failed to update invoice! Invoice with id '${id}' not found.`);

    Object.assign(findInvoice, updateInvoiceDto);
    await findInvoice.save();
  }

  async remove(id: number) {
    const findInvoice = await this.invoiceModel.findOneAndDelete({ _id: id }).exec();
    if (!findInvoice) throw new NotFoundException(`Failed to delete Invoice! Invoice with id '${id}' not found.`);
    return findInvoice;
  }
}
