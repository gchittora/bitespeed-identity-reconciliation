import { ContactRepository } from '../repositories/contact.repository.js';
import type { Contact, ContactRequest, ContactResponse } from '../types/contact.types.js';
import { LinkPrecedence } from '../types/contact.types.js';
import type { Logger } from '../utils/logger.js';

export class ContactService {
  constructor(
    private contactRepository: ContactRepository,
    private logger: Logger
  ) {}

  async identifyContact(request: ContactRequest): Promise<ContactResponse> {
    const { email, phoneNumber } = request;
    
    this.logger.info('Processing contact identification', { email: !!email, phoneNumber: !!phoneNumber });

    try {
      // Step 1: Find all contacts matching email or phoneNumber
      const contacts = await this.contactRepository.findContactsByEmailOrPhone(email, phoneNumber);

      if (contacts.length === 0) {
        return await this.createNewPrimaryContact(email, phoneNumber);
      }

      // Step 2: Handle linking multiple primary contacts
      await this.consolidatePrimaryContacts(contacts);

      // Step 3: Find the primary contact
      const primaryContact = this.findPrimaryContact(contacts);

      // Step 4: Get all linked contacts
      const linkedContacts = await this.contactRepository.findLinkedContacts(primaryContact.id);

      // Step 5: Check if we need to create a new secondary contact
      const response = await this.buildContactResponse(
        primaryContact,
        linkedContacts,
        email,
        phoneNumber
      );

      this.logger.info('Contact identification completed', { 
        primaryContactId: response.contact.primaryContatctId,
        emailCount: response.contact.emails.length,
        phoneCount: response.contact.phoneNumbers.length,
        secondaryCount: response.contact.secondaryContactIds.length
      });

      return response;
    } catch (error) {
      this.logger.error('Error during contact identification', { error, email: !!email, phoneNumber: !!phoneNumber });
      throw error;
    }
  }

  private async createNewPrimaryContact(email?: string, phoneNumber?: string): Promise<ContactResponse> {
    this.logger.info('Creating new primary contact');
    
    const newContact = await this.contactRepository.createContact({
      ...(email && { email }),
      ...(phoneNumber && { phoneNumber }),
      linkPrecedence: LinkPrecedence.PRIMARY
    });

    return {
      contact: {
        primaryContatctId: newContact.id,
        emails: email ? [email] : [],
        phoneNumbers: phoneNumber ? [phoneNumber] : [],
        secondaryContactIds: []
      }
    };
  }

  private async consolidatePrimaryContacts(contacts: Contact[]): Promise<void> {
    const primaryContacts = contacts.filter(c => c.linkPrecedence === LinkPrecedence.PRIMARY);
    
    if (primaryContacts.length <= 1) {
      return;
    }

    this.logger.info('Consolidating multiple primary contacts', { count: primaryContacts.length });

    // Sort by creation date, oldest becomes the main primary
    primaryContacts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const mainPrimary = primaryContacts[0]!;
    
    // Get IDs of contacts to convert to secondary
    const contactIdsToUpdate = primaryContacts.slice(1).map(c => c.id);
    
    // Convert other primaries to secondary, linked to main primary
    await this.contactRepository.updateMultipleContactsToSecondary(contactIdsToUpdate, mainPrimary.id);
  }

  private findPrimaryContact(contacts: Contact[]): Contact {
    // First, try to find a primary contact in the results
    const primaryContact = contacts.find(c => c.linkPrecedence === LinkPrecedence.PRIMARY);
    
    if (primaryContact) {
      return primaryContact;
    }
    
    // If all contacts are secondary, follow the linkedId to find the primary
    // All secondaries should have the same linkedId pointing to their primary
    const secondaryWithLink = contacts.find(c => c.linkedId !== null);
    if (secondaryWithLink && secondaryWithLink.linkedId) {
      // We need to fetch the primary contact by its ID
      // For now, we'll use the linkedId value to create a reference
      // The actual primary will be included in the linkedContacts query
      return { ...secondaryWithLink, id: secondaryWithLink.linkedId } as Contact;
    }
    
    // Final fallback (shouldn't reach here)
    this.logger.warn('No primary contact found, using first contact as fallback');
    return contacts[0]!;
  }

  private async buildContactResponse(
    primaryContact: Contact,
    linkedContacts: Contact[],
    newEmail?: string,
    newPhoneNumber?: string
  ): Promise<ContactResponse> {
    // Collect unique emails and phone numbers
    const emailsSet = new Set<string>();
    const phoneNumbersSet = new Set<string>();
    const secondaryContactIds: number[] = [];

    linkedContacts.forEach(contact => {
      if (contact.email) emailsSet.add(contact.email);
      if (contact.phoneNumber) phoneNumbersSet.add(contact.phoneNumber);
      if (contact.linkPrecedence === LinkPrecedence.SECONDARY) {
        secondaryContactIds.push(contact.id);
      }
    });

    // Check if incoming email or phoneNumber are new
    const isEmailNew = newEmail ? !emailsSet.has(newEmail) : false;
    const isPhoneNew = newPhoneNumber ? !phoneNumbersSet.has(newPhoneNumber) : false;

    if (isEmailNew || isPhoneNew) {
      this.logger.info('Creating new secondary contact', { isEmailNew, isPhoneNew });
      
      const newSecondary = await this.contactRepository.createContact({
        ...(newEmail && { email: newEmail }),
        ...(newPhoneNumber && { phoneNumber: newPhoneNumber }),
        linkPrecedence: LinkPrecedence.SECONDARY,
        linkedId: primaryContact.id
      });

      secondaryContactIds.push(newSecondary.id);
      if (newEmail) emailsSet.add(newEmail);
      if (newPhoneNumber) phoneNumbersSet.add(newPhoneNumber);
    }

    // Build arrays with primary contact's email and phone first
    const emails: string[] = [];
    const phoneNumbers: string[] = [];

    // Add primary contact's email first
    if (primaryContact.email) {
      emails.push(primaryContact.email);
    }
    
    // Add other unique emails
    emailsSet.forEach(email => {
      if (email !== primaryContact.email) {
        emails.push(email);
      }
    });

    // Add primary contact's phone first
    if (primaryContact.phoneNumber) {
      phoneNumbers.push(primaryContact.phoneNumber);
    }
    
    // Add other unique phone numbers
    phoneNumbersSet.forEach(phone => {
      if (phone !== primaryContact.phoneNumber) {
        phoneNumbers.push(phone);
      }
    });

    return {
      contact: {
        primaryContatctId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds
      }
    };
  }
}
