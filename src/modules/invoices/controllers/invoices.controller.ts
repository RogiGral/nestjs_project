import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Req, Res } from '@nestjs/common';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { InvoiceEntity } from '../../../entitities';
import mongoose from 'mongoose';
import { HTML_INVOICE_TEMPLATE } from '../pdfTemplate';
import puppeteer from 'puppeteer';
import { Response } from 'express';
import { InvoicesService, MailerService } from '../services';
import { UsersService } from '../../../modules/users';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly userService: UsersService, private readonly invoicesService: InvoicesService, private readonly mailerService: MailerService,) { }

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto): Promise<InvoiceEntity> {
    return this.invoicesService.create(createInvoiceDto);
  }

  // @Post('createMany/:numberOfInvoices')
  // createMany(@Param('numberOfInvoices') numberOfInvoices: number): Promise<any> {
  //   return this.invoicesService.createMany(numberOfInvoices);
  // }

  @Get()
  async findAll(@Req() request) {
    const { nextInputCursor, prevInputCursor, limitNumber = 2, searchParams } = request.query;
    const { findInvoices, totalResults, prevCursor, nextCursor } = await this.invoicesService.findAll(nextInputCursor, prevInputCursor, limitNumber, searchParams);

    return { findInvoices, status: HttpStatus.OK, nextCursor, prevCursor, totalResults };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    const { findInvoice } = await this.invoicesService.findOne(id);

    return findInvoice;
  }

  @Get('generate/:id')
  async generateOne(@Param('id') id: string, @Res() res: Response) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    const { findInvoice } = await this.invoicesService.findOne(id);

    const htmlContent = HTML_INVOICE_TEMPLATE(findInvoice)

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    res.set({
      'Content-Type': 'application/json',
    });

    const user = await this.userService.findOne(findInvoice.userId);

    const timestamp = new Date().getTime();
    const fileName = `invoice_${user.findUser.companyName}_${user.findUser.username}_${timestamp}.pdf`;

    const mailerResponse = await this.mailerService.sendMail(
      user.findUser.email,
      'Your Invoice',
      'Please find attached your invoice.',
      [
        {
          filename: fileName,
          content: pdfBuffer,
        },
      ],
    );

    res.status(200).send();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    await this.invoicesService.update(id, updateInvoiceDto);
    return { message: "Invoice has been updated", statusCode: HttpStatus.CREATED }

  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    return this.invoicesService.remove(id);
  }
  // @Delete('delete/allInvoices')
  // removeAll() {
  //   return this.invoicesService.removeAllInvoices();
  // }
}

