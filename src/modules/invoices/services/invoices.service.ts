import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { Counter, InvoiceEntity } from '../../../entitities';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../../../modules/users';
import { SearchFilters } from '../../../common/consts';
import { HTML_INVOICE_TEMPLATE } from '../pdfTemplate';
import puppeteer from 'puppeteer';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(InvoiceEntity.name) private invoiceModel: Model<InvoiceEntity>,
    @InjectModel(Counter.name) private counterModel: Model<Counter>,
    private readonly userService: UsersService,
  ) { }

  async create(createInvoiceDto: CreateInvoiceDto) {
    const invoiceNumber = await this.getNextSequenceValue('invoiceNumber');
    const createInvoice = new this.invoiceModel({
      ...createInvoiceDto,
      finalAmount: createInvoiceDto.lineItems.reduce(
        (acc, item) => acc + item.amount_total,
        0,
      ),
      invoiceNumber,
    });

    const saveInvoice = await createInvoice.save();
    return saveInvoice;
  }

  async findAll(
    nextInputCursor: string,
    prevInputCursor: string,
    limit: number,
    searchParams: string,
  ) {
    const query: any = {};
    let sort: number = 1;
    if (nextInputCursor && prevInputCursor) {
      throw new ForbiddenException(
        'Cannot pass prev and next input cursor in same query',
      );
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

    const findInvoices = await this.invoiceModel
      .find(query)
      .populate('lineItems')
      .sort(sort == 1 ? { _id: 1 } : { _id: -1 })
      .limit(Number(limit) + 1);

    if (!findInvoices) throw new NotFoundException(`Invoices not found!`);

    const hasNextPage = findInvoices.length > limit;
    const hasPrevPage = !!prevInputCursor || (hasNextPage && !!nextInputCursor);

    const invoicesToReturn = hasNextPage
      ? findInvoices.slice(0, -1)
      : findInvoices;

    let nextCursor = hasNextPage
      ? invoicesToReturn[invoicesToReturn.length - 1]._id
      : null;
    let prevCursor = hasPrevPage ? invoicesToReturn[0]._id : null;

    if (sort === -1) {
      invoicesToReturn.reverse();
      [nextCursor, prevCursor] = [prevCursor, nextCursor];
    }

    return {
      findInvoices: invoicesToReturn,
      totalResults: invoicesToReturn.length,
      nextCursor,
      prevCursor,
    };
  }

  private parseSearchParams(searchParams: string): object {
    const params = searchParams ? searchParams.split(';') : [];
    const searchParamsObj: any = {};

    for (const param of params) {
      const [key, value] = param.split('=');

      const baseKey = key.split(/[<>]/)[0];
      if (!SearchFilters.includes(baseKey)) {
        throw new Error(`Invalid search parameter: ${key}`);
      }

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
    if (!findInvoice)
      throw new NotFoundException(`Invoice with id '${id}' not found!`);
    return { findInvoice };
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    const findInvoice = await this.invoiceModel.findOne({ _id: id }).exec();

    if (!findInvoice)
      throw new NotFoundException(
        `Failed to update invoice! Invoice with id '${id}' not found.`,
      );

    Object.assign(findInvoice, updateInvoiceDto);
    await findInvoice.save();
  }

  async remove(id: string) {
    const findInvoice = await this.invoiceModel
      .findOneAndDelete({ _id: id })
      .exec();
    if (!findInvoice)
      throw new NotFoundException(
        `Failed to delete Invoice! Invoice with id '${id}' not found.`,
      );
    return findInvoice;
  }

  async generatePDF(invoice: InvoiceEntity): Promise<Buffer> {
    const htmlContent = HTML_INVOICE_TEMPLATE(invoice);

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    return pdfBuffer;
  }

  async getNextSequenceValue(sequenceName: string): Promise<number> {
    const counter = await this.counterModel.findOneAndUpdate(
      { key: sequenceName },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true },
    );
    return counter.sequenceValue;
  }


}
