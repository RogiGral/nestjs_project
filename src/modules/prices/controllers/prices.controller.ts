import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PricesService } from '../services';
import { CreatePriceDto, UpdatePriceDto } from '../dto';

@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) { }

  @Post('create')
  create(@Body() createPriceDto: CreatePriceDto) {
    return this.pricesService.create(createPriceDto);
  }

  @Get('list')
  async findAll() {
    const result = await this.pricesService.findAll();
    return result
  }

  @Get('get/:id')
  findOne(@Param('id') id: string) {
    return this.pricesService.findOne(id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updatePriceDto: UpdatePriceDto) {
    return this.pricesService.update(+id, updatePriceDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.pricesService.remove(+id);
  }
}
