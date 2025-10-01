import { Router, type Request, type Response } from 'express';
import { ContactService } from '../services/contact.service.js';
import { ContactValidator } from '../validators/contact.validator.js';
import { ErrorHandler } from '../middleware/error.middleware.js';

export class ContactController {
  private router = Router();

  constructor(
    private contactService: ContactService,
    private errorHandler: ErrorHandler
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/identify', this.errorHandler.asyncHandler(this.identify.bind(this)));
  }

  private async identify(req: Request, res: Response): Promise<void> {
    // Validate request
    const validatedRequest = ContactValidator.validateIdentifyRequest(req.body);
    
    // Process the request
    const result = await this.contactService.identifyContact(validatedRequest);
    
    // Send response
    res.status(200).json(result);
  }

  getRouter(): Router {
    return this.router;
  }
}
