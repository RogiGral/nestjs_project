import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { InvoiceEntity } from '../../../entitities';
import mongoose from 'mongoose';
import { Response } from 'express';
import { InvoicesService, MailerService } from '../services';
import { UsersService } from '../../../modules/users';
import { JwtAuthGuard, ClaimsGuard } from 'src/common/guards';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly userService: UsersService,
    private readonly invoicesService: InvoicesService,
    private readonly mailerService: MailerService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  create(@Body() createInvoiceDto: CreateInvoiceDto): Promise<InvoiceEntity> {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  async findAll(@Req() request) {
    const {
      nextInputCursor,
      prevInputCursor,
      limitNumber = 2,
      searchParams,
    } = request.query;
    const { findInvoices, totalResults, prevCursor, nextCursor } =
      await this.invoicesService.findAll(
        nextInputCursor,
        prevInputCursor,
        limitNumber,
        searchParams,
      );

    return {
      findInvoices,
      status: HttpStatus.OK,
      nextCursor,
      prevCursor,
      totalResults,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  async findOne(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    const { findInvoice } = await this.invoicesService.findOne(id);

    return findInvoice;
  }

  @Get('generate/:id')
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  async generateOne(@Param('id') id: string, @Res() res: Response) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    const { findInvoice } = await this.invoicesService.findOne(id);

    const pdfBuffer = await this.invoicesService.generatePDF(findInvoice);

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
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    await this.invoicesService.update(id, updateInvoiceDto);
    return {
      message: 'Invoice has been updated',
      statusCode: HttpStatus.CREATED,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  remove(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    return this.invoicesService.remove(id);
  }
}
