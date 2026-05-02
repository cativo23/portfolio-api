import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { MailConfig } from '@config/mail.config';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private readonly config: MailConfig;
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<MailConfig>('mail')!;
  }

  async onModuleInit() {
    if (!this.config.enabled) {
      this.logger.log('Email notifications are disabled');
      return;
    }

    try {
      const nodemailer = await import('nodemailer');
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.user
          ? { user: this.config.user, pass: this.config.password }
          : undefined,
      });
      this.logger.log('Email transporter initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize email transporter: ${error}`);
    }
  }

  async sendNewContactNotification(
    name: string,
    email: string,
    message: string,
    subject?: string,
  ): Promise<void> {
    if (!this.config.enabled || !this.transporter) {
      this.logger.debug('Email not enabled or transporter not ready, skipping');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to: this.config.to,
        subject: subject
          ? `New contact: ${subject}`
          : `New contact from ${name}`,
        html: this.buildContactTemplate(name, email, message, subject),
        text: this.buildContactPlainText(name, email, message, subject),
      });
      this.logger.log(`Email notification sent for contact: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to send email notification: ${error}`);
      // Don't throw — email failures should not break contact submission
    }
  }

  private buildContactTemplate(
    name: string,
    email: string,
    message: string,
    subject?: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Source Code Pro', monospace; background: #1a1b26; color: #a9b1d6; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #16161e; border-radius: 8px; padding: 24px; border: 1px solid #565f89; }
    .header { color: #7dcfff; font-size: 18px; margin-bottom: 20px; }
    .header span { color: #9d7cd8; }
    .field { margin-bottom: 16px; }
    .label { color: #e0af68; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .value { color: #a9b1d6; font-size: 14px; margin-top: 4px; white-space: pre-wrap; }
    .message { background: #1a1b26; padding: 16px; border-radius: 4px; border-left: 3px solid #9ece6a; margin-top: 8px; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #565f89; color: #565f89; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><span>❯</span> New Contact Form Submission</div>

    <div class="field">
      <div class="label">Name</div>
      <div class="value">${this.escapeHtml(name)}</div>
    </div>

    <div class="field">
      <div class="label">Email</div>
      <div class="value"><a href="mailto:${this.escapeHtml(email)}" style="color: #7dcfff;">${this.escapeHtml(email)}</a></div>
    </div>

    ${
      subject
        ? `<div class="field">
      <div class="label">Subject</div>
      <div class="value">${this.escapeHtml(subject)}</div>
    </div>`
        : ''
    }

    <div class="field">
      <div class="label">Message</div>
      <div class="message">${this.escapeHtml(message)}</div>
    </div>

    <div class="footer">Sent from your portfolio contact form — cativo.dev</div>
  </div>
</body>
</html>`;
  }

  private buildContactPlainText(
    name: string,
    email: string,
    message: string,
    subject?: string,
  ): string {
    return `New contact form submission\n\nName: ${name}\nEmail: ${email}${subject ? `\nSubject: ${subject}` : ''}\n\nMessage:\n${message}\n\n---\nSent from your portfolio contact form — cativo.dev`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
