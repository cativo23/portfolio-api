import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import type { MailConfig } from '@config/mail.config';

// Mock nodemailer before importing service
const mockCreateTransport = vi.fn();
vi.mock('nodemailer', () => ({
  createTransport: mockCreateTransport,
}));

const mockConfigService = {
  get: vi.fn(),
};

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;
  let loggerSpy: {
    log: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    debug: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);

    loggerSpy = {
      log: vi.spyOn(Logger.prototype, 'log').mockReturnValue(undefined),
      error: vi.spyOn(Logger.prototype, 'error').mockReturnValue(undefined),
      debug: vi.spyOn(Logger.prototype, 'debug').mockReturnValue(undefined),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    Object.values(loggerSpy).forEach((spy) => spy.mockRestore());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should skip transporter creation when email is disabled', async () => {
      const disabledConfig: MailConfig = {
        enabled: false,
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        user: 'user@example.com',
        password: 'password',
        from: 'from@example.com',
        to: 'to@example.com',
      };
      mockConfigService.get.mockReturnValue(disabledConfig);

      // Re-create service to pick up the config
      const moduleRef = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const disabledService = moduleRef.get<EmailService>(EmailService);

      await disabledService.onModuleInit();

      expect(mockCreateTransport).not.toHaveBeenCalled();
      expect(loggerSpy.log).toHaveBeenCalledWith(
        'Email notifications are disabled',
      );
    });

    it('should create transporter with auth when user is provided', async () => {
      const mockTransporter = {
        sendMail: vi.fn(),
      };
      mockCreateTransport.mockReturnValue(mockTransporter);

      const enabledConfig: MailConfig = {
        enabled: true,
        host: 'smtp.example.com',
        port: 587,
        secure: true,
        user: 'user@example.com',
        password: 'password123',
        from: 'from@example.com',
        to: 'to@example.com',
      };
      mockConfigService.get.mockReturnValue(enabledConfig);

      const moduleRef = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const enabledService = moduleRef.get<EmailService>(EmailService);

      await enabledService.onModuleInit();

      expect(mockCreateTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 587,
        secure: true,
        auth: {
          user: 'user@example.com',
          pass: 'password123',
        },
      });
      expect(loggerSpy.log).toHaveBeenCalledWith(
        'Email transporter initialized',
      );
    });

    it('should create transporter with undefined auth when no user is provided', async () => {
      const mockTransporter = {
        sendMail: vi.fn(),
      };
      mockCreateTransport.mockReturnValue(mockTransporter);

      const enabledConfig: MailConfig = {
        enabled: true,
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        user: '',
        password: '',
        from: 'from@example.com',
        to: 'to@example.com',
      };
      mockConfigService.get.mockReturnValue(enabledConfig);

      const moduleRef = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const enabledService = moduleRef.get<EmailService>(EmailService);

      await enabledService.onModuleInit();

      expect(mockCreateTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: undefined,
      });
    });

    it('should catch and log errors during transporter initialization', async () => {
      const testError = new Error('Import failed');
      mockCreateTransport.mockImplementation(() => {
        throw testError;
      });

      const enabledConfig: MailConfig = {
        enabled: true,
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        user: '',
        password: '',
        from: 'from@example.com',
        to: 'to@example.com',
      };
      mockConfigService.get.mockReturnValue(enabledConfig);

      const moduleRef = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const enabledService = moduleRef.get<EmailService>(EmailService);

      // Should not throw
      await expect(enabledService.onModuleInit()).resolves.not.toThrow();

      expect(loggerSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize email transporter'),
      );
    });
  });

  describe('sendNewContactNotification', () => {
    beforeEach(() => {
      const enabledConfig: MailConfig = {
        enabled: true,
        host: 'smtp.example.com',
        port: 587,
        secure: true,
        user: 'user@example.com',
        password: 'password123',
        from: 'sender@example.com',
        to: 'recipient@example.com',
      };
      mockConfigService.get.mockReturnValue(enabledConfig);
    });

    it('should skip sending when email is disabled', async () => {
      const disabledConfig: MailConfig = {
        enabled: false,
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        user: '',
        password: '',
        from: 'sender@example.com',
        to: 'recipient@example.com',
      };
      mockConfigService.get.mockReturnValue(disabledConfig);

      const moduleRef = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const disabledService = moduleRef.get<EmailService>(EmailService);

      await disabledService.sendNewContactNotification(
        'John',
        'john@example.com',
        'Test message',
      );

      expect(mockCreateTransport).not.toHaveBeenCalled();
      expect(loggerSpy.debug).toHaveBeenCalledWith(
        'Email not enabled or transporter not ready, skipping',
      );
    });

    it('should skip sending when transporter is not initialized', async () => {
      // Service is created but onModuleInit not called, so transporter is null
      await service.sendNewContactNotification(
        'John',
        'john@example.com',
        'Test message',
      );

      expect(loggerSpy.debug).toHaveBeenCalledWith(
        'Email not enabled or transporter not ready, skipping',
      );
    });

    it('should use "New contact from {name}" as subject when no subject provided', async () => {
      const mockTransporter = {
        sendMail: vi.fn().mockResolvedValue({
          accepted: ['recipient@example.com'],
        }),
      };
      mockCreateTransport.mockReturnValue(mockTransporter);

      const moduleRef = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const enabledService = moduleRef.get<EmailService>(EmailService);

      await enabledService.onModuleInit();
      await enabledService.sendNewContactNotification(
        'Alice',
        'alice@example.com',
        'Hello from Alice',
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'New contact from Alice',
        }),
      );
    });

    it('should use "New contact: {subject}" when subject is provided', async () => {
      const mockTransporter = {
        sendMail: vi.fn().mockResolvedValue({
          accepted: ['recipient@example.com'],
        }),
      };
      mockCreateTransport.mockReturnValue(mockTransporter);

      const moduleRef = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const enabledService = moduleRef.get<EmailService>(EmailService);

      await enabledService.onModuleInit();
      await enabledService.sendNewContactNotification(
        'Bob',
        'bob@example.com',
        'A longer message',
        'Collaboration',
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'New contact: Collaboration',
        }),
      );
    });

    it('should include from and to from config in email', async () => {
      const mockTransporter = {
        sendMail: vi.fn().mockResolvedValue({
          accepted: ['recipient@example.com'],
        }),
      };
      mockCreateTransport.mockReturnValue(mockTransporter);

      const moduleRef = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const enabledService = moduleRef.get<EmailService>(EmailService);

      await enabledService.onModuleInit();
      await enabledService.sendNewContactNotification(
        'Charlie',
        'charlie@example.com',
        'Test',
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'sender@example.com',
          to: 'recipient@example.com',
        }),
      );
    });

    it('should not throw when sendMail rejects', async () => {
      const mockTransporter = {
        sendMail: vi.fn().mockRejectedValue(new Error('SMTP error')),
      };
      mockCreateTransport.mockReturnValue(mockTransporter);

      const moduleRef = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const enabledService = moduleRef.get<EmailService>(EmailService);

      await enabledService.onModuleInit();

      await expect(
        enabledService.sendNewContactNotification(
          'Dave',
          'dave@example.com',
          'Test',
        ),
      ).resolves.not.toThrow();

      expect(loggerSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send email notification'),
      );
    });

    it('should escape HTML entities in contact name', async () => {
      const mockTransporter = {
        sendMail: vi.fn().mockResolvedValue({
          accepted: ['recipient@example.com'],
        }),
      };
      mockCreateTransport.mockReturnValue(mockTransporter);

      const moduleRef = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const enabledService = moduleRef.get<EmailService>(EmailService);

      await enabledService.onModuleInit();
      await enabledService.sendNewContactNotification(
        '<script>alert("xss")</script>',
        'test@example.com',
        'Message',
      );

      const call = mockTransporter.sendMail.mock.calls[0][0];
      expect(call.html).toContain('&lt;script&gt;');
      expect(call.html).not.toContain('<script>');
    });

    it('should escape HTML entities in contact email', async () => {
      const mockTransporter = {
        sendMail: vi.fn().mockResolvedValue({
          accepted: ['recipient@example.com'],
        }),
      };
      mockCreateTransport.mockReturnValue(mockTransporter);

      const moduleRef = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const enabledService = moduleRef.get<EmailService>(EmailService);

      await enabledService.onModuleInit();
      await enabledService.sendNewContactNotification(
        'Eve',
        'eve+<test>@example.com',
        'Message',
      );

      const call = mockTransporter.sendMail.mock.calls[0][0];
      expect(call.html).toContain('&lt;test&gt;');
      expect(call.html).not.toContain('<test>');
    });

    it('should escape HTML entities in message body', async () => {
      const mockTransporter = {
        sendMail: vi.fn().mockResolvedValue({
          accepted: ['recipient@example.com'],
        }),
      };
      mockCreateTransport.mockReturnValue(mockTransporter);

      const moduleRef = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const enabledService = moduleRef.get<EmailService>(EmailService);

      await enabledService.onModuleInit();
      await enabledService.sendNewContactNotification(
        'Frank',
        'frank@example.com',
        'Message with "quotes" & <tags>',
      );

      const call = mockTransporter.sendMail.mock.calls[0][0];
      expect(call.html).toContain('&quot;');
      expect(call.html).toContain('&amp;');
      expect(call.html).toContain('&lt;');
      expect(call.html).not.toContain('"quotes"');
      expect(call.html).not.toContain('<tags>');
    });

    it('should escape HTML entities in subject', async () => {
      const mockTransporter = {
        sendMail: vi.fn().mockResolvedValue({
          accepted: ['recipient@example.com'],
        }),
      };
      mockCreateTransport.mockReturnValue(mockTransporter);

      const moduleRef = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const enabledService = moduleRef.get<EmailService>(EmailService);

      await enabledService.onModuleInit();
      await enabledService.sendNewContactNotification(
        'Grace',
        'grace@example.com',
        'Message',
        'Subject with <script> & "quotes"',
      );

      const call = mockTransporter.sendMail.mock.calls[0][0];
      expect(call.html).toContain('&lt;script&gt;');
      expect(call.html).toContain('&quot;');
      expect(call.html).toContain('&amp;');
    });

    it('should include plain text without subject when subject not provided', async () => {
      const mockTransporter = {
        sendMail: vi.fn().mockResolvedValue({
          accepted: ['recipient@example.com'],
        }),
      };
      mockCreateTransport.mockReturnValue(mockTransporter);

      const moduleRef = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const enabledService = moduleRef.get<EmailService>(EmailService);

      await enabledService.onModuleInit();
      await enabledService.sendNewContactNotification(
        'Henry',
        'henry@example.com',
        'My message content',
      );

      const call = mockTransporter.sendMail.mock.calls[0][0];
      expect(call.text).toContain('Name: Henry');
      expect(call.text).toContain('Email: henry@example.com');
      expect(call.text).toContain('Message:\nMy message content');
      expect(call.text).not.toContain('Subject:');
    });

    it('should include plain text with subject when subject is provided', async () => {
      const mockTransporter = {
        sendMail: vi.fn().mockResolvedValue({
          accepted: ['recipient@example.com'],
        }),
      };
      mockCreateTransport.mockReturnValue(mockTransporter);

      const moduleRef = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const enabledService = moduleRef.get<EmailService>(EmailService);

      await enabledService.onModuleInit();
      await enabledService.sendNewContactNotification(
        'Iris',
        'iris@example.com',
        'My message content',
        'Job Inquiry',
      );

      const call = mockTransporter.sendMail.mock.calls[0][0];
      expect(call.text).toContain('Name: Iris');
      expect(call.text).toContain('Email: iris@example.com');
      expect(call.text).toContain('Subject: Job Inquiry');
      expect(call.text).toContain('Message:\nMy message content');
    });

    it('should log success when email is sent', async () => {
      const mockTransporter = {
        sendMail: vi.fn().mockResolvedValue({
          accepted: ['recipient@example.com'],
        }),
      };
      mockCreateTransport.mockReturnValue(mockTransporter);

      const moduleRef = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const enabledService = moduleRef.get<EmailService>(EmailService);

      await enabledService.onModuleInit();
      await enabledService.sendNewContactNotification(
        'Jack',
        'jack@example.com',
        'Test',
      );

      expect(loggerSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Email notification sent for contact: Jack'),
      );
    });
  });
});
