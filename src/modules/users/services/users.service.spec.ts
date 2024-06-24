import { TestingModule, Test } from "@nestjs/testing";
import { InvoiceEntity, UserEntity } from "../../../entitities";
import { UsersService } from "./users.service";
import { GeneratePassword } from "../../../common/utilities";
import { getModelToken } from "@nestjs/mongoose";
import { RegisterUserDto } from "../dto";
import { Model } from "mongoose";

export const EXCLUDE_FIELDS = '-__v -password';

const mockGeneratePassword = {
    GeneratePassword: jest.fn()
};
const mockInvoiceModel = {
    find: jest.fn(),
    populate: jest.fn(),
};

const mockUserModel = {
    new: jest.fn(),
    constructor: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    populate: jest.fn(),
    select: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
};

describe('UsersService', () => {
    let service: UsersService;
    let userModel: Model<UserEntity>;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getModelToken(UserEntity.name),
                    useValue: mockUserModel
                },
                {
                    provide: GeneratePassword,
                    useValue: mockGeneratePassword
                },
                {
                    provide: getModelToken(InvoiceEntity.name),
                    useValue: mockInvoiceModel
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        userModel = module.get<Model<UserEntity>>(getModelToken(UserEntity.name));
    });


    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should find all users with populated invoices', async () => {

        const invoices = [{
            _id: "667155ffe5430f0786497b9a",
            amount: 200,
            date: "2024-04-04T00:00:00.000Z",
            description: "TAX PAYMENT",
            userId: "666ac614f09126b9126bdd92",
            __v: 0
        }, {
            _id: "827444ffe5434f0785497a1a",
            amount: 100,
            date: "2024-04-04T00:00:00.000Z",
            description: "TAX PAYMENT",
            userId: "666ac614f09126b9126bdd92",
            __v: 0
        }];

        const users = [{
            _id: "666ac614f09126b9126bdd92",
            username: "superadmin",
            email: "superadmin@currencyservice.com",
            claims: [
                "MANAGE"
            ],
            invoices: invoices
        },
        {
            _id: "666c2ea07c21c8599c077f97",
            username: "user",
            email: "user@gmail.com",
            claims: [
                "CAN_ACCESS_USER_STATUS",
                "CAN_ACCESS_USER_READ"
            ],
            invoices: []
        },
        ];

        mockUserModel.find.mockReturnValueOnce({
            populate: jest.fn().mockReturnValue(Promise.resolve(users)),
        } as any);

        const result = await service.findAll();

        expect(mockUserModel.find).toHaveBeenCalled();
        expect(result).toEqual({ findUsers: users });

    });
});
