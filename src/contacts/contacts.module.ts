import { Module } from '@nestjs/common';
import { ContactsController } from '@contacts/contacts.controller';
import { ContactsService } from '@contacts/contacts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from '@contacts/entities/contact.entity';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Contact]), AuthModule],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
