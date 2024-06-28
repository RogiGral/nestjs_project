import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { Counter, InvoiceEntity } from '../../../entitities';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../../../modules/users';

@Injectable()
export class InvoicesService {

  constructor(
    @InjectModel(InvoiceEntity.name) private invoiceModel: Model<InvoiceEntity>,
    @InjectModel(Counter.name) private counterModel: Model<Counter>,
    private readonly userService: UsersService
  ) { }

  async create(createInvoiceDto: CreateInvoiceDto) {
    const invoiceNumber = await this.getNextSequenceValue('invoiceNumber');
    const user = await this.userService.findOne(createInvoiceDto.userId)
    const createInvoice = new this.invoiceModel({
      ...createInvoiceDto,
      companyName: user.companyName,
      invoiceNumber
    });
    const saveInvoice = await createInvoice.save()
    await this.userService.addInvoiceToUser(createInvoiceDto.userId, saveInvoice._id.toString());
    return saveInvoice
  }


  async findAll(nextInputCursor: string, prevInputCursor: string, limit: number, searchParams: string) {
    let query: any = {};
    let sort: number = 1;
    if (nextInputCursor && prevInputCursor) {
      throw new ForbiddenException('Cannot pass prev and next input cursor in same query');
    }
    if (nextInputCursor) {
      query._id = { $gt: nextInputCursor };
      sort = 1;
    }
    if (prevInputCursor) {
      query._id = { $lt: prevInputCursor };
      sort = -1;
    }

    const searchParamsObj = this.parseSearchParams(searchParams);

    for (const key in searchParamsObj) {
      if (searchParamsObj.hasOwnProperty(key)) {
        query[key] = searchParamsObj[key];
      }
    }

    const findInvoices = await this.invoiceModel.find(query).sort(sort == 1 ? { _id: 1 } : { _id: -1 }).limit(Number(limit) + 1);

    if (!findInvoices) throw new NotFoundException(`Invoices not found!`);

    let hasNextPage = findInvoices.length > limit;
    let hasPrevPage = !!prevInputCursor || (hasNextPage && !!nextInputCursor);

    const invoicesToReturn = hasNextPage ? findInvoices.slice(0, -1) : findInvoices;

    let nextCursor = hasNextPage ? invoicesToReturn[invoicesToReturn.length - 1]._id : null;
    let prevCursor = hasPrevPage ? invoicesToReturn[0]._id : null;

    if (sort === -1) {
      invoicesToReturn.reverse();
      [nextCursor, prevCursor] = [prevCursor, nextCursor];
    }

    return {
      findInvoices: invoicesToReturn,
      totalResults: invoicesToReturn.length,
      nextCursor,
      prevCursor
    };
  }

  private parseSearchParams(searchParams: string): object {

    const params = searchParams ? searchParams.split(';') : [];
    const searchParamsObj: any = {};

    for (const param of params) {
      const [key, value] = param.split('=');
      const parsedValue = this.parseValue(value);
      searchParamsObj[key] = parsedValue;
    }

    return searchParamsObj;
  }

  private parseValue(value: string): any {
    const operators = ['>=', '<=', '>', '<', '='];
    let operator = '';
    let parsedValue: any = value;

    for (const op of operators) {
      if (value.includes(op)) {
        operator = op;
        parsedValue = value.replace(op, '');
        break;
      }
    }

    switch (operator) {
      case '>=':
        return { $gte: parsedValue };
      case '<=':
        return { $lte: parsedValue };
      case '>':
        return { $gt: parsedValue };
      case '<':
        return { $lt: parsedValue };
      case '=':
        return parsedValue;
      default:
        return parsedValue;
    }
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

  async removeAllInvoices(): Promise<any> {
    const deleteResult = await this.invoiceModel.deleteMany({});
    if (!deleteResult) throw new NotFoundException(`Failed to delete invoices!`);

    await this.counterModel.findOneAndUpdate(
      { key: 'invoiceNumber' },
      { sequenceValue: 0 },
      { new: true, upsert: true }
    );

    return deleteResult;
  }

  async getNextSequenceValue(sequenceName: string): Promise<number> {
    const counter = await this.counterModel.findOneAndUpdate(
      { key: sequenceName },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );
    return counter.sequenceValue;
  }

  async getSequenceValuesBatch(sequenceName: string, count: number): Promise<number[]> {
    const sequencePromises = Array.from({ length: count }, () => this.getNextSequenceValue(sequenceName));
    return Promise.all(sequencePromises);
  }

  async createMany(numberOfInvoices: number) {
    const invoices = [];
    const batchSize = 1000;
    const userId = [
      '667417d2ae277ff0ee35bdae',
      '667417d9ae277ff0ee35bdb1',
      '667417e0ae277ff0ee35bdb4',
      '667417e8ae277ff0ee35bdb7',
      '667c0375518a3787d4a56b52',
      '667c0384518a3787d4a56b58',
      '667c038c518a3787d4a56b5b',
      '667c0394518a3787d4a56b5e',
      '667c039c518a3787d4a56b61',
      '667c03a3518a3787d4a56b64'
    ];
    const companyName = 'TEST_COMPANY';
    const baseDate = new Date();

    for (let batchStart = 0; batchStart < numberOfInvoices; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, numberOfInvoices);
      const batchInvoices = [];
      const sequenceValues = await this.getSequenceValuesBatch('invoiceNumber', batchEnd - batchStart);

      for (let i = batchStart; i < batchEnd; i++) {
        batchInvoices.push({
          amount: 100 + i,
          date: new Date(baseDate.getTime() + i * 86400000),
          description: `Test Invoice ${i}`,
          userId: userId[i % 10],
          companyName: companyName,
          invoiceNumber: sequenceValues[i - batchStart],
        });
      }

      try {
        await this.invoiceModel.insertMany(batchInvoices);
        console.log(`Invoices ${batchStart} to ${batchEnd - 1} added successfully`);
      } catch (error) {
        console.error(`Error adding invoices ${batchStart} to ${batchEnd - 1}:`, error);
        throw error;
      }

    }

    await this.counterModel.findOneAndUpdate(
      { key: 'invoiceNumber' },
      { sequenceValue: numberOfInvoices },
      { new: true, upsert: true }
    );

  }

}
