// File: back/src/utils/email.utils.ts
// Last change: Overriding email recipient to feggyo@gmail.com in non-production environments.

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import Handlebars, { TemplateDelegate } from 'handlebars';
import { logger } from '@sendeliver/logger'; // Assuming logger is available

// Email template cache
const templates: Record<string, TemplateDelegate> = {};

// Placeholder for a real email transporter.
// In a production environment, you would configure this with your SMTP details (e.g., SendGrid, Mailgun).
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email", // Example: Ethereal Mail for testing
  port: 587,
  secure: false, // Use 'true' for 465, 'false' for other ports
  auth: {
    user: "melisa.kulas@ethereal.email", // Replace with your Ethereal user/password or actual SMTP credentials
    pass: "wxrC6jXz4R7RRHgM8t",
  },
});

/**
 * Load and compile email template.
 * @param templateName - Name of the template file (without extension).
 * @returns Compiled Handlebars template.
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
 * Send an email (stub implementation, logs or sends to test email).
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
      to: process.env.NODE_ENV !== 'production' ? 'fedorcak.jan@gmail.com' : to, // OVERRIDE RECIPIENT FOR TESTING
      subject,
      html,
      text: html.replace(/<[^>]*>/g, ''),
    };

    // Log email instead of sending in development, or use nodemailer for actual sending.
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Email would be sent to ${mailOptions.to} (originally ${to}): ${JSON.stringify(mailOptions)}`);
      // In development, you might still want to send via Ethereal for full testing,
      // or just rely on logs. For now, we'll log it.
      // If you want to actually send in dev, uncomment transporter.sendMail(mailOptions)
      // and ensure Ethereal/SMTP credentials are set up.
      // const info = await transporter.sendMail(mailOptions);
      // console.log('[EMAIL] Dev email sent. Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } else {
      // In production, use the actual transporter.
      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${info.messageId}`);
    }
    
    return { messageId: `stub-${Date.now()}`, status: 'logged' }; // Still return stub for consistency
  } catch (error) {
    logger.error(`Failed to process email to ${options.to}:`, error);
    throw error;
  }
};

/**
 * Send a test email (stub implementation, logs or sends to test email).
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
