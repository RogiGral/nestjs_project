import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { InvoicesService } from '../services/invoices.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { InvoiceEntity } from '../../../entitities';
import mongoose from 'mongoose';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) { }

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto): Promise<InvoiceEntity> {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  async findAll() {
    const { findInvoices } = await this.invoicesService.findAll();
    return findInvoices;
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
