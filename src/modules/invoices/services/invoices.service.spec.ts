import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { InvoicesService } from './invoices.service';
import { UsersService } from '../../../modules/users';
import { InvoiceEntity, Counter } from '../../../entitities';
import { Model } from 'mongoose';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';

describe('InvoicesService', () => {
  let invoiceService: InvoicesService;
  let invoiceModel: Model<InvoiceEntity>;
  let counterModel: Model<Counter>;
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        UsersService,
        {
          provide: getModelToken(InvoiceEntity.name),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneAndDelete: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getModelToken(Counter.name),
          useValue: {
            findOneAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    invoiceService = module.get<InvoicesService>(InvoicesService);
    invoiceModel = module.get<Model<InvoiceEntity>>(
      getModelToken(InvoiceEntity.name),
    );
    counterModel = module.get<Model<Counter>>(getModelToken(Counter.name));
    userService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create and save an invoice and add it to the user', async () => {
      const createInvoiceDto: CreateInvoiceDto = {
        amount: 0,
        date: undefined,
        description: '',
        userId: '',
      };

      const invoiceNumber = 1; // Provide the expected invoice number

      const saveInvoice = {
        amount: 0,
        date: undefined,
        description: '',
        userId: '',
        companyName: '',
        _id: '1234567890',
      };

      jest
        .spyOn(invoiceService, 'getNextSequenceValue')
        .mockResolvedValue(invoiceNumber);
      jest.spyOn(invoiceModel.prototype, 'save').mockResolvedValue(saveInvoice);
      jest.spyOn(userService, 'addInvoiceToUser').mockResolvedValue(undefined);

      const result = await invoiceService.create(createInvoiceDto);

      expect(invoiceService.getNextSequenceValue).toHaveBeenCalledWith(
        'invoiceNumber',
      );
      expect(invoiceModel.prototype.save).toHaveBeenCalled();
      expect(userService.addInvoiceToUser).toHaveBeenCalledWith(
        createInvoiceDto.userId,
        saveInvoice._id.toString(),
      );
      expect(result).toEqual(saveInvoice);
    });
  });

  describe('findAll', () => {
    it('should return an array of invoices', async () => {
      const cursor = '123';
      const limit = 10;

      const findInvoices = [
        {
          amount: 0,
          date: undefined,
          description: '',
          userId: '',
          companyName: '',
          _id: '1234567890',
        },
      ];

      jest.spyOn(invoiceModel, 'find').mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(findInvoices),
        }),
      } as any);

      const result = await invoiceService.findAll(cursor, limit);

      expect(invoiceModel.find).toHaveBeenCalledWith({ _id: { $gt: cursor } });
      expect(result).toEqual({
        totalResults: findInvoices.length,
        findInvoices,
      });
    });

    it('should throw a NotFoundException if no invoices are found', async () => {
      const cursor = '123';
      const limit = 10;

      jest.spyOn(invoiceModel, 'find').mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      } as any);

      await expect(invoiceService.findAll(cursor, limit)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single invoice', async () => {
      const id = '123';

      const findInvoice = {
        amount: 0,
        date: undefined,
        description: '',
        userId: '',
        companyName: '',
        _id: '1234567890',
      };

      jest.spyOn(invoiceModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(findInvoice),
      } as any);

      const result = await invoiceService.findOne(id);

      expect(invoiceModel.findOne).toHaveBeenCalledWith({ _id: id });
      expect(result).toEqual({ findInvoice });
    });

    it('should throw a NotFoundException if invoice not found', async () => {
      const id = '123';

      jest.spyOn(invoiceModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(invoiceService.findOne(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an existing invoice', async () => {
      const id = '123';
      const updateInvoiceDto: UpdateInvoiceDto = {
        // Provide the necessary properties for updateInvoiceDto
      };

      const findInvoice = {
        amount: 0,
        date: undefined,
        description: '',
        userId: '',
        companyName: '',
        _id: '1234567890',
      };

      jest.spyOn(invoiceModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(findInvoice),
        save: jest.fn(),
      } as any);

      await invoiceService.update(id, updateInvoiceDto);

      expect(invoiceModel.findOne).toHaveBeenCalledWith({ _id: id });
      expect(findInvoice).toMatchObject(updateInvoiceDto);
    });

    it('should throw a NotFoundException if invoice not found', async () => {
      const id = '123';
      const updateInvoiceDto: UpdateInvoiceDto = {
        amount: 0,
        date: undefined,
        description: '',
        userId: '',
      };

      jest.spyOn(invoiceModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(invoiceService.update(id, updateInvoiceDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an existing invoice', async () => {
      const id = '123';

      const findInvoice = {
        amount: 0,
        date: undefined,
        description: '',
        userId: '',
        companyName: '',
        _id: '123',
      };

      jest.spyOn(invoiceModel, 'findOneAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(findInvoice),
      } as any);

      const result = await invoiceService.remove(id);

      expect(invoiceModel.findOneAndDelete).toHaveBeenCalledWith({ _id: id });
      expect(result).toEqual(findInvoice);
    });

    it('should throw a NotFoundException if invoice not found', async () => {
      const id = '123';

      jest.spyOn(invoiceModel, 'findOneAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(invoiceService.remove(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getNextSequenceValue', () => {
    it('should return the next sequence value', async () => {
      const sequenceName = 'invoiceNumber';
      const counter = {
        sequenceValue: 1,
      };

      jest.spyOn(counterModel, 'findOneAndUpdate').mockResolvedValue(counter);

      const result = await invoiceService.getNextSequenceValue(sequenceName);

      expect(counterModel.findOneAndUpdate).toHaveBeenCalledWith(
        { key: sequenceName },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true },
      );
      expect(result).toEqual(counter.sequenceValue);
    });
  });
});
