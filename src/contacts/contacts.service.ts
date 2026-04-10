import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Contact } from '@contacts/entities/contact.entity';
import { CreateContactDto } from '@contacts/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationUtil } from '@core/utils/pagination.util';
import { BaseCrudService } from '@core/services/base-crud.service';
import { NotFoundException } from '@core/exceptions';
import { EmailService } from '@email/email.service';

/**
 * Interface defining options for finding contacts with pagination, search, and filtering
 */
interface FindAllOptions {
  /** Page number for pagination */
  page: number;
  /** Number of items per page */
  per_page: number;
  /** Optional search term to filter contacts by name, email, or message */
  search?: string;
  /** Optional flag to filter contacts by read status */
  isRead?: boolean | undefined;
}

/**
 * Placeholder type for UpdateContactDto
 * Contacts don't have a general update operation, only markAsRead
 */
type UpdateContactDto = never;

/**
 * Service responsible for managing contact form submissions
 *
 * Provides methods for creating, retrieving, updating, and deleting contacts
 * Extends BaseCrudService to eliminate code duplication for common CRUD operations
 */
@Injectable()
export class ContactsService extends BaseCrudService<
  Contact,
  CreateContactDto,
  UpdateContactDto
> {
  protected readonly logger = new Logger(ContactsService.name);

  constructor(
    @InjectRepository(Contact)
    protected readonly contactsRepository: Repository<Contact>,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  protected get repository(): Repository<Contact> {
    return this.contactsRepository;
  }

  protected getEntityName(): string {
    return 'Contact';
  }

  /**
   * Creates a new contact form submission and sends email notification
   *
   * @param createContactDto - The contact form data
   * @returns Promise resolving to the created contact entity
   */
  override async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactsRepository.create(createContactDto);
    const savedContact = await this.contactsRepository.save(contact);

    // Send email notification (non-blocking, errors are handled internally)
    this.emailService.sendNewContactNotification(
      savedContact.name,
      savedContact.email,
      savedContact.message,
      savedContact.subject ?? undefined,
    );

    this.logger.log(`Created new contact: ${savedContact.name}`);
    return savedContact;
  }

  /**
   * Retrieves a paginated list of contacts with optional filtering
   *
   * @param options - Object containing pagination, search, and filtering options
   * @returns Promise resolving to contact entities with pagination metadata
   */
  async findAll(options: FindAllOptions): Promise<{
    items: Contact[];
    total: number;
    page: number;
    per_page: number;
  }> {
    const { page, per_page, search, isRead } = options;

    const result = await PaginationUtil.paginate(this.contactsRepository, {
      page,
      per_page,
      search,
      searchFields: ['name', 'email', 'message'],
      filters: {
        isRead: typeof isRead !== 'undefined' ? isRead : undefined,
      },
      alias: 'contacts',
    });

    this.logger.log(`Found ${result.total} contacts`);

    return result;
  }

  // create, findOne, and remove methods are inherited from BaseCrudService

  /**
   * Marks a contact as read
   *
   * @param id - The ID of the contact to mark as read
   * @returns Promise resolving to the updated contact entity
   * @throws NotFoundException if the contact doesn't exist
   */
  async markAsRead(id: number): Promise<Contact> {
    // Check if the contact exists
    const existingContact = await this.contactsRepository.findOne({
      where: { id },
    });

    if (!existingContact) {
      this.logger.warn(`Contact with ID ${id} not found`);
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    // Merge and save in one operation
    const updatedContact = this.contactsRepository.merge(existingContact, {
      isRead: true,
      readAt: new Date(),
    });
    const savedContact = await this.contactsRepository.save(updatedContact);
    this.logger.log(`Marked contact with ID ${id} as read`);

    return savedContact;
  }
}
