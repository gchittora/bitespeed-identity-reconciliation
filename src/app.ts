import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ContactController } from './controllers/contact.controller.js';
import { ContactService } from './services/contact.service.js';
import { ContactRepository } from './repositories/contact.repository.js';
import { ConsoleLogger } from './utils/logger.js';
import { ErrorHandler } from './middleware/error.middleware.js';

class Application {
  private app = express();
  private prisma = new PrismaClient();
  private logger = new ConsoleLogger();
  private errorHandler = new ErrorHandler(this.logger);
  
  constructor() {
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    
    // Request logging middleware
    this.app.use((req, res, next) => {
      this.logger.info('Incoming request', {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // Initialize dependencies
    const contactRepository = new ContactRepository(this.prisma);
    const contactService = new ContactService(contactRepository, this.logger);
    const contactController = new ContactController(contactService, this.errorHandler);

    // Mount routes
    this.app.use('/', contactController.getRouter());
  }

  private setupErrorHandling(): void {
    // Global error handler (must be last)
    this.app.use(this.errorHandler.handleError);
  }

  async start(port: number = 3000): Promise<void> {
    try {
      // Test database connection
      await this.prisma.$connect();
      this.logger.info('Database connected successfully');

      // Start server
      this.app.listen(port, () => {
        this.logger.info(`Server running on port ${port}`);
      });

      // Graceful shutdown handlers
      this.setupGracefulShutdown();
    } catch (error) {
      this.logger.error('Failed to start application', { error });
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      this.logger.info(`Received ${signal}, starting graceful shutdown`);
      
      try {
        await this.prisma.$disconnect();
        this.logger.info('Database disconnected');
        process.exit(0);
      } catch (error) {
        this.logger.error('Error during shutdown', { error });
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }
}

// Start the application
const app = new Application();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.start(port).catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
