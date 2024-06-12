import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services';
import { UserDto } from '../dto';
import { HttpException } from '@nestjs/common';

describe('UsersController', () => {
    let controller: UsersController;
    let userService: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: {
                        create: jest.fn(),
                        findAll: jest.fn(),
                        findOne: jest.fn(),
                        findByUsername: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        userService = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a user', async () => {
            const createUserDto: UserDto = {
                username: 'user',
                email: 'email@email.com',
                password: 'pass'
            };
            await controller.create(createUserDto);
            expect(userService.create).toHaveBeenCalledWith(createUserDto);
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            const users = [{
                _id: "6666e8f64e299345e58c0f0e",
                username: "user",
                email: "email@email.com",
                password: "pass",
                __v: 0
            }];
            jest.spyOn(userService, 'findAll').mockResolvedValue(users as any);
            expect(await controller.findAll()).toEqual(users);
        });
    });

    describe('findOne', () => {
        it('should find a user by id', async () => {
            const userId = '6666e8f64e299345e58c0f0e';
            const user = {
                _id: "6666e8f64e299345e58c0f0e",
                username: "user",
                email: "email@email.com",
                password: "pass",
                __v: 0
            };
            jest.spyOn(userService, 'findOne').mockResolvedValue(user as any);
            expect(await controller.findOne(userId)).toEqual(user);
        });

        it('should throw 404 if user not found', async () => {
            const userId = '6666e8f64e299345e58c0f0e';
            jest.spyOn(userService, 'findOne').mockResolvedValue(null);
            await expect(controller.findOne(userId)).rejects.toThrow(HttpException);
        });

        it('should throw 400 if id is invalid', async () => {
            const userId = 'invalid_id';
            await expect(controller.findOne(userId)).rejects.toThrow(HttpException);
        });
    });

    describe('findOneByUsername', () => {
        it('should find a user by username', async () => {
            const username = 'user';
            const user = {
                _id: "6666e8f64e299345e58c0f0e",
                username: "user",
                email: "email@email.com",
                password: "pass",
                __v: 0
            };
            jest.spyOn(userService, 'findByUsername').mockResolvedValue(user as any);
            expect(await controller.findOneByUsername(username)).toEqual(user);
        });

        it('should throw 404 if user not found', async () => {
            const username = 'invalid_user';
            jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);
            await expect(controller.findOneByUsername(username)).rejects.toThrow(HttpException);
        });
    });

    describe('update', () => {
        it('should update a user', async () => {
            const userId = '6666e8f64e299345e58c0f0e';
            const updateUser = {
                _id: "6666e8f64e299345e58c0f0e",
                username: "user",
                email: "email@email.com",
                password: "pass",
                __v: 0
            };
            await controller.update(userId, updateUser as any);
            expect(userService.update).toHaveBeenCalledWith(userId, updateUser);
        });

        it('should throw 400 if id is invalid', async () => {
            const invalidId = 'invalid_id';
            await expect(controller.update(invalidId, {} as any)).rejects.toThrow(HttpException);
        });
    });

    describe('remove', () => {
        it('should remove a user', async () => {
            const userId = '6666e8f64e299345e58c0f0e';
            await controller.remove(userId);
            expect(userService.remove).toHaveBeenCalledWith(userId);
        });

        it('should throw 400 if id is invalid', async () => {
            const invalidId = 'invalid_id';
            await expect(controller.remove(invalidId)).rejects.toThrow(HttpException);
        });
    });

});
