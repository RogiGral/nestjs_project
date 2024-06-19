import { getModelToken } from "@nestjs/mongoose";
import { TestingModule, Test } from "@nestjs/testing";
import { InvoiceEntity, InvoiceSchema, UserEntity, UserSchema } from "../../../entitities";
import { UsersService } from "./users.service";

export const EXCLUDE_FIELDS = '-__v -password';

describe('UsersService', () => {
    let service: UsersService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getModelToken(UserEntity.name),
                    useValue: UserSchema,
                },
                {
                    provide: getModelToken(InvoiceEntity.name),
                    useValue: InvoiceSchema,
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

});