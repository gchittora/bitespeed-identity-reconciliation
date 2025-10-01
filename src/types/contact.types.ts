export interface ContactRequest {
  email?: string;
  phoneNumber?: string;
}

export interface Contact {
  id: number;
  email: string | null;
  phoneNumber: string | null;
  linkedId: number | null;
  linkPrecedence: LinkPrecedence;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export enum LinkPrecedence {
  PRIMARY = 'primary',
  SECONDARY = 'secondary'
}

export interface ContactResponse {
  contact: {
    primaryContatctId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

export interface ContactCreationData {
  email?: string;
  phoneNumber?: string;
  linkPrecedence: LinkPrecedence;
  linkedId?: number;
}
