import { getModelToken } from "@nestjs/mongoose";
import { TestingModule, Test } from "@nestjs/testing";
import { UserEntity } from "..//../../entity";
import { UsersService } from "./users.service";
import { NotFoundException } from "@nestjs/common";

const mockUser = {
    data: {
        _id: "6666e8f64e299345e58c0f0e",
        username: "igor",
        email: "igor@gmail.com",
    }
}
const mockAllUsers =
    [{
        _id: "6666e8f64e299345e58c0f0e",
        username: "igor",
        email: "igor@gmail.com",
    }, {
        _id: "7777e8f64e299345e58c0f0e",
        username: "damian",
        email: "damian@gmail.com",
    }];
const mockId = '6666e8f64e299345e58c0f0e';
const mockIdError = 'error';
export const EXCLUDE_FIELDS = '-__v -password';

class MockedUserModel {
    constructor(private _: any) { }
    new = jest.fn().mockResolvedValue({});
    static save = jest.fn().mockResolvedValue(mockUser);
    static find = jest.fn().mockReturnThis();
    static create = jest.fn().mockReturnValue(mockUser);
    static findOneAndDelete = jest.fn().mockImplementation((id: string) => {
        if (id == mockIdError) throw new NotFoundException();
        return this;
    });
    static exec = jest.fn().mockReturnValue(mockUser);
    static select = jest.fn().mockReturnThis();
    static findOne = jest.fn().mockImplementation((id: string) => {
        if (id == mockIdError) throw new NotFoundException();
        return this;
    });
}

describe('UsersService', () => {
    let service: UsersService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getModelToken(UserEntity.name),
                    useValue: MockedUserModel,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });


    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should find all users', async () => {
        const expectedOutput = await service.findAll();
        expect(MockedUserModel.find).toHaveBeenCalledTimes(1);
        expect(expectedOutput).toEqual(mockAllUsers);
    });

});