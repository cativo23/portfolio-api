import { registerAs } from '@nestjs/config';
import { trimEnvQuotes } from '@config/env.utils';

export interface MailConfig {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  to: string;
}

export default registerAs(
  'mail',
  (): MailConfig => ({
    enabled: process.env.MAIL_ENABLED === 'true',
    host: trimEnvQuotes(process.env.MAIL_HOST) || 'localhost',
    port: parseInt(trimEnvQuotes(process.env.MAIL_PORT) || '587', 10),
    secure: trimEnvQuotes(process.env.MAIL_SECURE) === 'true',
    user: trimEnvQuotes(process.env.MAIL_USER) || '',
    password: trimEnvQuotes(process.env.MAIL_PASSWORD) || '',
    from: trimEnvQuotes(process.env.MAIL_FROM) || 'portfolio@cativo.dev',
    to: trimEnvQuotes(process.env.MAIL_TO) || 'cativo@cativo.dev',
  }),
);
