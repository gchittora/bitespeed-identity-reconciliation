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

  // Step 1: Find all contacts with matching email or phoneNumber
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
    // No contact found, create a new primary contact
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

  // Existing contacts found - will need to consolidate them
  // TODO: Implement full logic for linking contacts, managing primary and secondary

  // For now, send back found contacts for further steps

  return res.status(200).json({ contacts });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
