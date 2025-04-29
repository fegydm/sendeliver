/*
File: ./back/src/utils/email.ts
Last change: Added TypeScript typings and fixed implicit any errors
*/
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { logger } from '@sendeliver/logger';
import fs from 'fs';
import path from 'path';
import Handlebars, { TemplateDelegate } from 'handlebars';

// Email template cache
const templates: Record<string, TemplateDelegate> = {};

/**
 * Configure email transporter
 */
const createTransporter = (): Transporter => {
  const config = {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || 'user@example.com',
      pass: process.env.EMAIL_PASSWORD || 'password',
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  };

  return nodemailer.createTransport(config);
};

/**
 * Load and compile email template
 * @param templateName - Name of the template file (without extension)
 * @returns Compiled Handlebars template
 */
const getEmailTemplate = (templateName: string): TemplateDelegate => {
  if (templates[templateName]) {
    return templates[templateName];
  }

  try {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'templates',
      'emails',
      `${templateName}.hbs`
    );
    const source = fs.readFileSync(templatePath, 'utf-8');
    const compiled = Handlebars.compile(source);
    templates[templateName] = compiled;
    return compiled;
  } catch (error) {
    logger.error(`Failed to load email template (${templateName}):`, error);
    return Handlebars.compile('<p>{{message}}</p>');
  }
};

interface SendEmailOptions {
  to: string;
  subject: string;
  template?: string;
  context: Record<string, unknown>;
  from?: string;
}

/**
 * Send an email
 */
export const sendEmail = async (options: SendEmailOptions): Promise<any> => {
  const {
    to,
    subject,
    template,
    context,
    from = process.env.EMAIL_FROM || 'noreply@sendeliver.com',
  } = options;

  try {
    const transporter = createTransporter();
    let html: string;

    if (template) {
      const tpl = getEmailTemplate(template);
      html = tpl(context);
    } else if ('message' in context) {
      html = `<p>${String(context.message)}</p>`;
    } else {
      throw new Error('Either template or context.message is required');
    }

    const mailOptions: SendMailOptions = {
      from,
      to,
      subject,
      html,
      text: html.replace(/<[^>]*>/g, ''),
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${subject}`);
    return result;
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}:`, error);
    throw error;
  }
};

/**
 * Send a test email
 */
export const sendTestEmail = async (): Promise<any> => {
  const testReceiver = process.env.EMAIL_TEST_RECEIVER || process.env.EMAIL_USER;
  if (!testReceiver) {
    throw new Error('No test receiver configured. Set EMAIL_TEST_RECEIVER or EMAIL_USER.');
  }
  return sendEmail({
    to: testReceiver,
    subject: 'Sendeliver Email Test',
    context: {
      message: 'This is a test email to verify the email delivery configuration.',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
};

export default { sendEmail, sendTestEmail };
