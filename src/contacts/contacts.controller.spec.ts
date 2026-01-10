import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { Repository } from 'typeorm';
import {
  CreateContactDto,
  ContactResponseDto,
  ContactsListResponseDto,
  SingleContactResponseDto,
} from './dto';
import { DeleteResponseDto } from '@projects/dto/delete-response.dto';
import { NotFoundException } from '@core/exceptions';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('ContactsController', () => {
  let controller: ContactsController;
  let service: ContactsService;

  const mockContact: Contact = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello, I would like to get in touch...',
    subject: 'Project Inquiry',
    isRead: false,
    readAt: null,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
    deletedAt: null,
  } as Contact;

  const mockContactResponseDto = ContactResponseDto.fromEntity(mockContact);

  const mockSingleContactResponseDto =
    SingleContactResponseDto.fromEntity(mockContact);

  const mockContactsListResponseDto = ContactsListResponseDto.fromEntities(
    [mockContactResponseDto],
    1,
    10,
    1,
  );

  const mockDeleteResponseDto = DeleteResponseDto.withMessage(
    'Contact successfully deleted',
  );

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    markAsRead: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        { provide: ContactsService, useValue: mockService },
        {
          provide: getRepositoryToken(Contact),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => ({ JWT_SECRET: 'test-secret' })[key]),
          },
        },
      ],
    }).compile();

    controller = module.get<ContactsController>(ContactsController);
    service = module.get<ContactsService>(ContactsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new contact and return it', async () => {
      const dto: CreateContactDto = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, I would like to get in touch...',
        subject: 'Project Inquiry',
      };

      mockService.create.mockResolvedValue(mockContact);

      const result = await controller.create(dto);

      expect(result).toEqual(mockSingleContactResponseDto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should create a contact without optional subject', async () => {
      const dto: CreateContactDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello, I would like to get in touch...',
      };

      const contactWithoutSubject = { ...mockContact, subject: undefined };
      mockService.create.mockResolvedValue(contactWithoutSubject);

      const result = await controller.create(dto);

      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should throw if service throws', async () => {
      const dto: CreateContactDto = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello',
      };

      mockService.create.mockRejectedValue(new Error('Error creating'));

      await expect(controller.create(dto)).rejects.toThrow('Error creating');
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of contacts', async () => {
      mockService.findAll.mockResolvedValue({
        items: [mockContact],
        total: 1,
        page: 1,
        per_page: 10,
      });

      const query = { page: 1, per_page: 10 };
      const response = await controller.findAll(query as any);

      expect(response).toEqual(mockContactsListResponseDto);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        per_page: 10,
        search: undefined,
        isRead: undefined,
      });
    });

    it('should apply search filter when provided', async () => {
      mockService.findAll.mockResolvedValue({
        items: [mockContact],
        total: 1,
        page: 1,
        per_page: 10,
      });

      const query = { page: 1, per_page: 10, search: 'John' };
      await controller.findAll(query as any);

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        per_page: 10,
        search: 'John',
        isRead: undefined,
      });
    });

    it('should apply isRead filter when provided', async () => {
      mockService.findAll.mockResolvedValue({
        items: [mockContact],
        total: 1,
        page: 1,
        per_page: 10,
      });

      const query = { page: 1, per_page: 10, is_read: true };
      await controller.findAll(query as any);

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        per_page: 10,
        search: undefined,
        isRead: true,
      });
    });

    it('should throw if service fails', async () => {
      mockService.findAll.mockRejectedValue(new Error('Find error'));
      const query = { page: 1, per_page: 10 };

      await expect(controller.findAll(query as any)).rejects.toThrow(
        'Find error',
      );
    });
  });

  describe('findOne', () => {
    it('should return a single contact', async () => {
      mockService.findOne.mockResolvedValue(mockContact);
      const result = await controller.findOne(1);

      expect(result).toEqual(mockSingleContactResponseDto);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw if not found', async () => {
      mockService.findOne.mockRejectedValue(new NotFoundException('Not found'));

      await expect(controller.findOne(2)).rejects.toThrow('Not found');
    });
  });

  describe('markAsRead', () => {
    it('should mark a contact as read and return it', async () => {
      const readContact = { ...mockContact, isRead: true, readAt: new Date() };
      mockService.markAsRead.mockResolvedValue(readContact);

      const result = await controller.markAsRead(1);

      expect(result).toBeDefined();
      expect(service.markAsRead).toHaveBeenCalledWith(1);
    });

    it('should throw if contact not found', async () => {
      mockService.markAsRead.mockRejectedValue(
        new NotFoundException('Contact not found'),
      );

      await expect(controller.markAsRead(99)).rejects.toThrow(
        'Contact not found',
      );
    });
  });

  describe('remove', () => {
    it('should return success message on deletion', async () => {
      mockService.remove.mockResolvedValue(mockDeleteResponseDto);

      const result = await controller.remove(1);

      expect(result).toBe(mockDeleteResponseDto);
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw if deletion fails', async () => {
      mockService.remove.mockRejectedValue(
        new NotFoundException('Cannot delete'),
      );

      await expect(controller.remove(99)).rejects.toThrow('Cannot delete');
    });
  });
});
