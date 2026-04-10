import { Module } from '@nestjs/common';
import { ContactsController } from '@contacts/contacts.controller';
import { ContactsService } from '@contacts/contacts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from '@contacts/entities/contact.entity';
import { AuthModule } from '@auth/auth.module';
import { EmailModule } from '@email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Contact]), AuthModule, EmailModule],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
