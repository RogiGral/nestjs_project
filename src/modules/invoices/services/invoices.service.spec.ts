import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { InvoiceEntity, InvoiceSchema, UserEntity, UserSchema } from '../../../entitities';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from '../../../modules/users';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto, UpdateInvoiceDto } from '../dto';

export const INVOICE_ID = '667155ffe5430f0786497b9a';
export const mockInvoiceRecord = {
  _id: INVOICE_ID,
  amount: 200,
  date: new Date("2024-04-04T00:00:00.000Z"),
  description: "TAX PAYMENT",
  userId: "666ac614f09126b9126bdd92"
};

describe('InvoicesService', () => {
  let invoiceService: InvoicesService;
  let invoiceModel: Model<InvoiceEntity>;
  let userService: UsersService;

  beforeEach(async () => {

    const mockInvoiceModel = {
      new: jest.fn(),
      constructor: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneAndDelete: jest.fn(),
      save: jest.fn(),
      exec: jest.fn(),
    };

    const mockUserService = {
      addInvoiceToUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: getModelToken(InvoiceEntity.name),
          useValue: mockInvoiceModel,
        },
      ],
    }).compile();
    invoiceService = module.get<InvoicesService>(InvoicesService);
    invoiceModel = module.get<Model<InvoiceEntity>>(getModelToken(InvoiceEntity.name));
    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(invoiceService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of invoices', async () => {
      jest.spyOn(invoiceModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockInvoiceRecord]),
      } as any);

      const result = await invoiceService.findAll();

      expect(invoiceModel.find).toHaveBeenCalled();
      expect(result).toEqual({ findInvoices: [mockInvoiceRecord] });
    });
  });

  describe('findOne', () => {
    it('should return a single invoice', async () => {
      jest.spyOn(invoiceModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInvoiceRecord),
      } as any);

      const result = await invoiceService.findOne(INVOICE_ID);

      expect(invoiceModel.findOne).toHaveBeenCalledWith({ _id: INVOICE_ID });
      expect(result).toEqual({ findInvoice: mockInvoiceRecord });
    });

    it('should throw a NotFoundException if invoice not found', async () => {
      jest.spyOn(invoiceModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(invoiceService.findOne(INVOICE_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should throw a NotFoundException if invoice not found', async () => {
      jest.spyOn(invoiceModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(invoiceService.update(INVOICE_ID, {} as UpdateInvoiceDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an existing invoice', async () => {
      jest.spyOn(invoiceModel, 'findOneAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInvoiceRecord),
      } as any);

      const result = await invoiceService.remove(INVOICE_ID);

      expect(invoiceModel.findOneAndDelete).toHaveBeenCalledWith({ _id: INVOICE_ID });
      expect(result).toEqual(mockInvoiceRecord);
    });

    it('should throw a NotFoundException if invoice not found', async () => {
      jest.spyOn(invoiceModel, 'findOneAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(invoiceService.remove(INVOICE_ID)).rejects.toThrow(NotFoundException);
    });
  });

  // describe('create', () => {
  //   it('should create and save an invoice and add it to the user', async () => {
  //     const createInvoiceDto: CreateInvoiceDto = mockInvoiceRecord
  //     const savedInvoice = { _id: 'invoiceId', ...createInvoiceDto };

  //     const mockSave = jest.fn().mockResolvedValue(savedInvoice);
  //     const mockCreate = jest.fn().mockImplementation(() => ({
  //       save: mockSave,
  //     }));

  //     (invoiceModel as any).mockImplementation(mockCreate);

  //     jest.spyOn(userService, 'addInvoiceToUser').mockResolvedValue(undefined);

  //     const result = await invoiceService.create(createInvoiceDto);

  //     expect(mockCreate).toHaveBeenCalledWith(createInvoiceDto);
  //     expect(mockSave).toHaveBeenCalled();
  //     expect(userService.addInvoiceToUser).toHaveBeenCalledWith(createInvoiceDto.userId, savedInvoice._id.toString());
  //     expect(result).toEqual(savedInvoice);

  //   });
  // });

});
