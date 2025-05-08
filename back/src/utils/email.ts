// File: ./back/src/utils/email.ts
// Last change: Removed nodemailer, implemented logging-based email stub

import { logger } from '@sendeliver/logger';
import fs from 'fs';
import path from 'path';
import Handlebars, { TemplateDelegate } from 'handlebars';

// Email template cache
const templates: Record<string, TemplateDelegate> = {};

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
 * Send an email (stub implementation, logs instead of sending)
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
    let html: string;

    if (template) {
      const tpl = getEmailTemplate(template);
      html = tpl(context);
    } else if ('message' in context) {
      html = `<p>${String(context.message)}</p>`;
    } else {
      throw new Error('Either template or context.message is required');
    }

    const mailOptions = {
      from,
      to,
      subject,
      html,
      text: html.replace(/<[^>]*>/g, ''),
    };

    // Log email instead of sending
    logger.info(`Email would be sent: ${JSON.stringify(mailOptions)}`);
    return { messageId: `stub-${Date.now()}`, status: 'logged' };
  } catch (error) {
    logger.error(`Failed to process email to ${options.to}:`, error);
    throw error;
  }
};

/**
 * Send a test email (stub implementation, logs instead of sending)
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