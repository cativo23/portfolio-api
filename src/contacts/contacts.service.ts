import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto';
import { DeleteResponseDto } from '@projects/dto/delete-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InternalServerException } from '@core/exceptions/internal-server.exception';
import { NotFoundException } from '@core/exceptions/not-found.exception';

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
 * Service responsible for managing contact form submissions
 *
 * Provides methods for creating, retrieving, updating, and deleting contacts
 */
@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
  ) {}

  /**
   * Creates a new contact form submission
   *
   * @param createContactDto - Data transfer object containing contact details
   * @returns Promise resolving to the created contact entity
   * @throws InternalServerException if there's an error during creation
   */
  async create(createContactDto: CreateContactDto): Promise<Contact> {
    try {
      const contact = this.contactsRepository.create(createContactDto);
      const savedContact = await this.contactsRepository.save(contact);
      this.logger.log(`Contact created with ID ${savedContact.id}`);
      return savedContact;
    } catch (error) {
      this.logger.error('Error creating contact', error.stack);
      throw new InternalServerException('Error creating contact');
    }
  }

  /**
   * Retrieves a paginated list of contacts with optional filtering
   *
   * @param options - Object containing pagination, search, and filtering options
   * @returns Promise resolving to contact entities with pagination metadata
   * @throws InternalServerException if there's an error during retrieval
   */
  async findAll(
    options: FindAllOptions,
  ): Promise<{
    items: Contact[];
    total: number;
    page: number;
    per_page: number;
  }> {
    try {
      const { page, per_page, search, isRead } = options;
      const query = this.contactsRepository.createQueryBuilder('contacts');

      // Filtering by search
      if (search) {
        query.andWhere(
          'contacts.name LIKE :search OR contacts.email LIKE :search OR contacts.message LIKE :search',
          {
            search: `%${search}%`,
          },
        );
      }

      // Filtering by isRead
      if (typeof isRead !== 'undefined') {
        query.andWhere('contacts.isRead = :isRead', { isRead });
      }

      // Add ordering (newest first)
      query.orderBy('contacts.createdAt', 'DESC');

      // Pagination
      query.skip((page - 1) * per_page).take(per_page);

      // Execute the query and get [data, total count]
      const [items, total] = await query.getManyAndCount();

      this.logger.log(`Found ${total} contacts`);

      return {
        items,
        total,
        page,
        per_page,
      };
    } catch (error) {
      this.logger.error('Error finding contacts', error.stack);
      throw new InternalServerException('Error finding contacts');
    }
  }

  /**
   * Retrieves a single contact by its ID
   *
   * @param id - The ID of the contact to retrieve
   * @returns Promise resolving to the contact entity
   * @throws NotFoundException if the contact doesn't exist
   * @throws InternalServerException if there's an error during retrieval
   */
  async findOne(id: number): Promise<Contact> {
    try {
      const contact = await this.contactsRepository.findOne({
        where: { id: id },
      });

      if (!contact) {
        this.logger.warn(`Contact with ID ${id} not found`);
        throw new NotFoundException(`Contact with ID ${id} not found`);
      }

      this.logger.log(`Found contact with ID ${id}`);
      return contact;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding contact with ID ${id}`, error.stack);
      throw new InternalServerException(`Error finding contact with ID ${id}`);
    }
  }

  /**
   * Marks a contact as read
   *
   * @param id - The ID of the contact to mark as read
   * @returns Promise resolving to the updated contact entity
   * @throws NotFoundException if the contact doesn't exist
   * @throws InternalServerException if there's an error during update
   */
  async markAsRead(id: number): Promise<Contact> {
    try {
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error marking contact with ID ${id} as read`,
        error.stack,
      );
      throw new InternalServerException(
        `Error marking contact with ID ${id} as read`,
      );
    }
  }

  /**
   * Deletes a contact by its ID
   *
   * @param id - The ID of the contact to delete
   * @returns Promise resolving to a standardized response with a success message
   * @throws NotFoundException if the contact doesn't exist
   * @throws InternalServerException if there's an error during deletion
   */
  async remove(id: number): Promise<DeleteResponseDto> {
    try {
      // Check if a contact exists
      const existingContact = await this.contactsRepository.findOne({
        where: { id },
      });

      if (!existingContact) {
        this.logger.warn(`Contact with ID ${id} not found`);
        throw new NotFoundException(`Contact with ID ${id} not found`);
      }

      // Delete contact
      const result = await this.contactsRepository.delete(id);

      if (result.affected === 0) {
        this.logger.error(`Failed to delete contact with ID ${id}`);
        throw new InternalServerException(
          `Failed to delete contact with ID ${id}`,
        );
      }

      this.logger.log(`Deleted contact with ID ${id}`);
      return DeleteResponseDto.withMessage('Contact successfully deleted');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error deleting contact with ID ${id}`, error.stack);
      throw new InternalServerException(`Error deleting contact with ID ${id}`);
    }
  }
}
