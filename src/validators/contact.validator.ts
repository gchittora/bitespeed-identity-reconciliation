import type { ContactRequest } from '../types/contact.types.js';

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ContactValidator {
  static validateIdentifyRequest(body: any): ContactRequest {
    if (!body || typeof body !== 'object') {
      throw new ValidationError('Request body must be a valid object');
    }

    const { email, phoneNumber } = body;

    // At least one of email or phoneNumber must be provided
    if (!email && !phoneNumber) {
      throw new ValidationError('Either email or phoneNumber must be provided');
    }

    // Validate email format if provided
    if (email !== undefined) {
      if (typeof email !== 'string') {
        throw new ValidationError('Email must be a string', 'email');
      }
      if (email.trim() === '') {
        throw new ValidationError('Email cannot be empty', 'email');
      }
      if (!this.isValidEmail(email)) {
        throw new ValidationError('Email format is invalid', 'email');
      }
    }

    // Validate phone number format if provided
    if (phoneNumber !== undefined) {
      if (typeof phoneNumber !== 'string') {
        throw new ValidationError('Phone number must be a string', 'phoneNumber');
      }
      if (phoneNumber.trim() === '') {
        throw new ValidationError('Phone number cannot be empty', 'phoneNumber');
      }
      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new ValidationError('Phone number format is invalid', 'phoneNumber');
      }
    }

    return {
      email: email?.trim() || undefined,
      phoneNumber: phoneNumber?.trim() || undefined
    };
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation - adjust regex based on your requirements
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''));
  }
}
