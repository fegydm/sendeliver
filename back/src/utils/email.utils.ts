// File: back/src/utils/email.utils.ts
// Last change: Replace Handlebars with template literals for email templates

import nodemailer from 'nodemailer';
import { logger } from '@sendeliver/logger';

// Email templates using template literals
const emailTemplates = {
  'email-verification': (context: any) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verify Your Sendeliver Account</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9f9f9;
        }
        .header {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .content {
            padding: 20px;
        }
        .button {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
        }
        .code {
            font-size: 1.2em;
            font-weight: bold;
            color: #007bff;
            background-color: #e9f7ff;
            padding: 8px 12px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 10px;
        }
        .footer {
            margin-top: 20px;
            font-size: 0.8em;
            color: #777;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Logistar/Sendeliver Account Verification</h2>
        </div>
        <div class="content">
            <p>Hello ${context.displayName || 'User'},</p>
            <p>Thank you for registering with Logistar. Please verify your email address to activate your account.</p>
            
            <p>To verify your email, simply click the button below:</p>
            <p style="text-align: center;">
                <a href="${context.verificationLink}" class="button">Verify My Email</a>
            </p>
            
            <p>Alternatively, you can use the following verification code directly in the app:</p>
            <p style="text-align: center;">
                <span class="code">${context.verificationCode}</span>
            </p>
            
            <p>This verification code/link will expire in ${context.expirationMinutes || 60} minutes.</p>
            
            <p>If you did not register for an account, please ignore this email.</p>
            <p>Best regards,<br/>The Logistar Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${context.currentYear || new Date().getFullYear()} Logistar/Sendeliver. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
};

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "melisa.kulas@ethereal.email",
    pass: "wxrC6jXz4R7RRHgM8t",
  },
});

/**
 * Get email template by name.
 */
const getEmailTemplate = (templateName: string): ((context: any) => string) => {
  const template = emailTemplates[templateName as keyof typeof emailTemplates];
  if (!template) {
    logger.error(`Email template not found: ${templateName}`);
    return (context: any) => `<p>${context.message || 'Template not found'}</p>`;
  }
  return template;
};

interface SendEmailOptions {
  to: string;
  subject: string;
  template?: string;
  context: Record<string, unknown>;
  from?: string;
}

/**
 * Send an email using template literals instead of Handlebars.
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
      const templateFn = getEmailTemplate(template);
      html = templateFn(context);
    } else if ('message' in context) {
      html = `<p>${String(context.message)}</p>`;
    } else {
      throw new Error('Either template or context.message is required');
    }

    const mailOptions = {
      from,
      to: process.env.NODE_ENV !== 'production' ? 'fedorcak.jan@gmail.com' : to,
      subject,
      html,
      text: html.replace(/<[^>]*>/g, ''),
    };

    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Email would be sent to ${mailOptions.to} (originally ${to}): ${JSON.stringify(mailOptions)}`);
    } else {
      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${info.messageId}`);
    }
    
    return { messageId: `stub-${Date.now()}`, status: 'logged' };
  } catch (error) {
    logger.error(`Failed to process email to ${options.to}:`, error);
    throw error;
  }
};

/**
 * Send a test email.
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