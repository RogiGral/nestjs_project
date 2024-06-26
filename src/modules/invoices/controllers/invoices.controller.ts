import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, NotFoundException, Req, Res } from '@nestjs/common';
import { InvoicesService } from '../services/invoices.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { InvoiceEntity } from '../../../entitities';
import mongoose from 'mongoose';
import { HTML_INVOICE_TEMPLATE } from '../pdfTemplate';
import puppeteer from 'puppeteer';
import { Response } from 'express';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) { }

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto): Promise<InvoiceEntity> {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  async findAll(@Req() request) {
    const { cursor, limit = 5 } = request.query;
    const { findInvoices, totalResults } = await this.invoicesService.findAll(cursor, limit);

    const prevCursor = cursor && findInvoices.length > 0 ? findInvoices[0]._id : null;
    const nextCursor = findInvoices.length > 0 ? findInvoices[findInvoices.length - 1]._id : null;

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
  async geneateOne(@Param('id') id: string, @Res() res: Response) {
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
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${findInvoice.userId}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
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
}

