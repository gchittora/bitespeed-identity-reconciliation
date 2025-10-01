import { PrismaClient } from '@prisma/client';
import type { Contact, ContactCreationData } from '../types/contact.types.js';
import { LinkPrecedence } from '../types/contact.types.js';

export class ContactRepository {
  constructor(private prisma: PrismaClient) {}

  async findContactsByEmailOrPhone(email?: string, phoneNumber?: string): Promise<Contact[]> {
    const result = await this.prisma.contact.findMany({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phoneNumber ? [{ phoneNumber }] : [])
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
    return result as Contact[];
  }

  async findLinkedContacts(primaryContactId: number): Promise<Contact[]> {
    const result = await this.prisma.contact.findMany({
      where: {
        OR: [
          { id: primaryContactId },
          { linkedId: primaryContactId }
        ]
      }
    });
    return result as Contact[];
  }

  async createContact(data: ContactCreationData): Promise<Contact> {
    const result = await this.prisma.contact.create({
      data: {
        email: data.email || null,
        phoneNumber: data.phoneNumber || null,
        linkPrecedence: data.linkPrecedence,
        linkedId: data.linkedId || null
      }
    });
    return result as Contact;
  }

  async updateContactToSecondary(contactId: number, linkedId: number): Promise<Contact> {
    const result = await this.prisma.contact.update({
      where: { id: contactId },
      data: {
        linkPrecedence: LinkPrecedence.SECONDARY,
        linkedId
      }
    });
    return result as Contact;
  }

  async updateMultipleContactsToSecondary(contactIds: number[], linkedId: number): Promise<void> {
    await this.prisma.contact.updateMany({
      where: {
        id: {
          in: contactIds
        }
      },
      data: {
        linkPrecedence: LinkPrecedence.SECONDARY,
        linkedId
      }
    });
  }
}
