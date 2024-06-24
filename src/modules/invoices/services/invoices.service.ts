import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { InvoiceEntity } from '../../../entitities';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../../../modules/users';

@Injectable()
export class InvoicesService {

  constructor(
    @InjectModel(InvoiceEntity.name) private invoiceModel: Model<InvoiceEntity>,
    private readonly userService: UsersService
  ) { }

  async create(createInvoiceDto: CreateInvoiceDto) {
    const createInvoice = new this.invoiceModel(createInvoiceDto);
    const saveInvoice = await createInvoice.save()
    await this.userService.addInvoiceToUser(createInvoiceDto.userId, saveInvoice._id.toString());
    return saveInvoice
  }

  async findAll(cursor: string, limit: number) {

    let query: any = {};
    if (cursor) {
      query._id = { $gt: cursor };
    }
    const findInvoices = await this.invoiceModel.find(query).limit(Number(limit)).exec()

    if (!findInvoices) throw new NotFoundException(`Invoices not found!`);



    return {
      totalResults: findInvoices.length,
      findInvoices
    };
  }

  async findOne(id: string) {
    const findInvoice = await this.invoiceModel.findOne({ _id: id }).exec();
    if (!findInvoice) throw new NotFoundException(`Invoice with id '${id}' not found!`);
    return { findInvoice };
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    const findInvoice = await this.invoiceModel.findOne({ _id: id }).exec();

    if (!findInvoice) throw new NotFoundException(`Failed to update invoice! Invoice with id '${id}' not found.`);

    Object.assign(findInvoice, updateInvoiceDto);
    await findInvoice.save();
  }

  async remove(id: string) {
    const findInvoice = await this.invoiceModel.findOneAndDelete({ _id: id }).exec();
    if (!findInvoice) throw new NotFoundException(`Failed to delete Invoice! Invoice with id '${id}' not found.`);
    return findInvoice;
  }
}
