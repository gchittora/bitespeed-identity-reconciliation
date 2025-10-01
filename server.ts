import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.use(express.json());

app.post('/identify', async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Email or phoneNumber is required' });
  }

  // Step 1: Find all contacts matching email or phoneNumber
  const contacts = await prisma.contact.findMany({
    where: {
      OR: [
        { email: email ?? undefined },
        { phoneNumber: phoneNumber ?? undefined }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });

  if (contacts.length === 0) {
    // No contacts exist, create a primary contact
    const newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: 'primary'
      }
    });

    return res.status(200).json({
      contact: {
        primaryContatctId: newContact.id,
        emails: email ? [email] : [],
        phoneNumbers: phoneNumber ? [phoneNumber] : [],
        secondaryContactIds: []
      }
    });
  }

  // Step 1.5: Handle linking multiple primary contacts
  const primaryContacts = contacts.filter(c => c.linkPrecedence === 'primary');
  if (primaryContacts.length > 1) {
    // Sort by creation date, oldest becomes the main primary
    primaryContacts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const mainPrimary = primaryContacts[0]!;
    
    // Convert other primaries to secondary, linked to main primary
    for (let i = 1; i < primaryContacts.length; i++) {
      await prisma.contact.update({
        where: { id: primaryContacts[i]!.id },
        data: {
          linkPrecedence: 'secondary',
          linkedId: mainPrimary.id
        }
      });
    }
  }

  // Step 2: Find primary contact (oldest with linkPrecedence 'primary')
  const primaryContact = contacts.find(c => c.linkPrecedence === 'primary') || contacts[0]!;

  // Step 3: Retrieve all contacts linked to primary (by id or linkedId)
  const linkedContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: primaryContact.id },
        { linkedId: primaryContact.id }
      ]
    }
  });

  // Step 4: Prepare unique emails & phoneNumbers arrays
  const emailsSet = new Set<string>();
  const phoneNumbersSet = new Set<string>();
  const secondaryContactIds: number[] = [];

  linkedContacts.forEach(contact => {
    if (contact.email) emailsSet.add(contact.email);
    if (contact.phoneNumber) phoneNumbersSet.add(contact.phoneNumber);
    if (contact.linkPrecedence === 'secondary') secondaryContactIds.push(contact.id);
  });

  // Step 5: Check if incoming email or phoneNumber are new - if yes, create secondary contact
  const isEmailNew = email ? !emailsSet.has(email) : false;
  const isPhoneNew = phoneNumber ? !phoneNumbersSet.has(phoneNumber) : false;

  if (isEmailNew || isPhoneNew) {
    const newSecondary = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: 'secondary',
        linkedId: primaryContact.id,
      }
    });

    secondaryContactIds.push(newSecondary.id);
    if (email) emailsSet.add(email);
    if (phoneNumber) phoneNumbersSet.add(phoneNumber);
  }

  return res.status(200).json({
    contact: {
      primaryContatctId: primaryContact.id,
      emails: Array.from(emailsSet),
      phoneNumbers: Array.from(phoneNumbersSet),
      secondaryContactIds,
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
