import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from './contacts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { NotFoundException, Logger } from '@nestjs/common';

describe('ContactsService', () => {
  let service: ContactsService;
  let repository: Repository<Contact>;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(async () => {
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(jest.fn());
    warnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(jest.fn());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: getRepositoryToken(Contact),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
    repository = module.get<Repository<Contact>>(getRepositoryToken(Contact));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new contact and return Contact entity', async () => {
      const createContactDto: CreateContactDto = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, I would like to get in touch...',
        subject: 'Project Inquiry',
      };
      const contact = { id: 1, ...createContactDto, isRead: false };

      jest.spyOn(repository, 'create').mockReturnValue(contact as any);
      jest.spyOn(repository, 'save').mockResolvedValue(contact as any);

      const result = await service.create(createContactDto);

      expect(result).toEqual(
        expect.objectContaining({
          id: contact.id,
          name: contact.name,
          email: contact.email,
          message: contact.message,
        }),
      );
      expect(logSpy).toHaveBeenCalledWith(`Contact created with ID ${contact.id}`);
    });

    it('should create a contact without optional subject', async () => {
      const createContactDto: CreateContactDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello, I would like to get in touch...',
      };
      const contact = { id: 1, ...createContactDto, isRead: false };

      jest.spyOn(repository, 'create').mockReturnValue(contact as any);
      jest.spyOn(repository, 'save').mockResolvedValue(contact as any);

      const result = await service.create(createContactDto);

      expect(result).toEqual(expect.objectContaining({ id: contact.id }));
    });
  });

  describe('findAll', () => {
    it('should return contacts with pagination metadata', async () => {
      const options = {
        page: 1,
        per_page: 10,
        search: '',
        isRead: undefined,
      };
      const contacts = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Hello',
        },
      ];
      const total = 1;

      jest.spyOn(repository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([contacts, total]),
          }) as any,
      );

      const result = await service.findAll(options);

      expect(result.items).toEqual(contacts);
      expect(result.total).toBe(total);
      expect(result.page).toBe(options.page);
      expect(result.per_page).toBe(options.per_page);
      expect(logSpy).toHaveBeenCalledWith(`Found ${total} contacts`);
    });

    it('should apply search filter when search is provided', async () => {
      const options = {
        page: 1,
        per_page: 10,
        search: 'john',
        isRead: undefined,
      };
      const contacts = [{ id: 1, name: 'John Doe', email: 'john@example.com' }];
      const total = 1;
      const andWhereMock = jest.fn().mockReturnThis();

      jest.spyOn(repository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            andWhere: andWhereMock,
            orderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([contacts, total]),
          }) as any,
      );

      await service.findAll(options);

      expect(andWhereMock).toHaveBeenCalledWith(
        '(contacts.name LIKE :search OR contacts.email LIKE :search OR contacts.message LIKE :search)',
        { search: '%john%' },
      );
    });

    it('should apply isRead filter when isRead is provided', async () => {
      const options = {
        page: 1,
        per_page: 10,
        search: '',
        isRead: true,
      };
      const contacts = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          isRead: true,
        },
      ];
      const total = 1;
      const andWhereMock = jest.fn().mockReturnThis();

      jest.spyOn(repository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            andWhere: andWhereMock,
            orderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([contacts, total]),
          }) as any,
      );

      await service.findAll(options);

      expect(andWhereMock).toHaveBeenCalledWith(
        'contacts.isRead = :isRead',
        { isRead: true },
      );
    });
  });

  describe('findOne', () => {
    it('should return Contact entity', async () => {
      const contact = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(contact as any);

      const result = await service.findOne(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: contact.id,
          name: contact.name,
        }),
      );
      expect(logSpy).toHaveBeenCalledWith(`Found contact with ID 1`);
    });

    it('should throw NotFoundException if contact not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOne(1)).rejects.toThrow(
        `Contact with ID 1 not found`,
      );
      expect(warnSpy).toHaveBeenCalledWith(`Contact with ID 1 not found`);
    });
  });

  describe('markAsRead', () => {
    it('should mark a contact as read and return updated entity', async () => {
      const existingContact = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello',
        isRead: false,
        readAt: null,
      };
      const updatedContact = {
        ...existingContact,
        isRead: true,
        readAt: new Date(),
      };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(existingContact as any);
      jest.spyOn(repository, 'merge').mockReturnValue(updatedContact as any);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedContact as any);

      const result = await service.markAsRead(1);

      expect(result.isRead).toBe(true);
      expect(result.readAt).toBeDefined();
      expect(logSpy).toHaveBeenCalledWith(`Marked contact with ID 1 as read`);
    });

    it('should throw NotFoundException if contact not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      await expect(service.markAsRead(1)).rejects.toThrow(
        `Contact with ID 1 not found`,
      );
      expect(warnSpy).toHaveBeenCalledWith(`Contact with ID 1 not found`);
    });
  });

  describe('remove', () => {
    it('should remove a contact and return DeleteResponseDto', async () => {
      const existingContact = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello',
      };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(existingContact as any);
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove(1);

      expect(result.data.message).toBe('Contact successfully deleted');
      expect(logSpy).toHaveBeenCalledWith(`Deleted contact with ID 1`);
    });

    it('should throw NotFoundException if contact not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      await expect(service.remove(1)).rejects.toThrow(
        `Contact with ID 1 not found`,
      );
      expect(warnSpy).toHaveBeenCalledWith(`Contact with ID 1 not found`);
    });
  });
});
