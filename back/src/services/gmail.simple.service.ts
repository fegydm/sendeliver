// File: back/src/services/gmail.simple.service.ts
// Last change: Fuck SendGrid - simple Gmail SMTP service that just works

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

class SimpleGmailService {
  private transporter!: nodemailer.Transporter; // Add ! to indicate it will be assigned
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Create Gmail transporter
      this.transporter = nodemailer.createTransport({ // Fix: createTransport not createTransporter
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER || 'your.email@gmail.com',
          pass: process.env.GMAIL_APP_PASSWORD || 'your_app_password', // NOT your regular password!
        },
      });

      // Test connection
      await this.transporter.verify();
      this.isInitialized = true;
      
      console.log('✅ Gmail email service initialized successfully');
      console.log(`📧 From: ${process.env.GMAIL_USER}`);
      
    } catch (error) {
      console.error('❌ Gmail service initialization failed:', error);
      console.log('💡 Setup instructions:');
      console.log('1. Enable 2FA on your Gmail account');
      console.log('2. Generate App Password: https://myaccount.google.com/apppasswords');
      console.log('3. Add to .env: GMAIL_USER=your@gmail.com GMAIL_APP_PASSWORD=your_16_char_password');
      throw error;
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Gmail service not initialized');
    }

    try {
      const htmlContent = this.renderTemplate(options.template, options.context);
      
      // Check EMAIL_MODE to determine recipient
      const isProduction = process.env.EMAIL_MODE === 'production';
      const finalRecipient = isProduction ? options.to : (process.env.TEST_EMAIL || options.to);
      const finalSubject = isProduction ? options.subject : `[DEV] ${options.subject}`;
      
      const mailOptions = {
        from: `"SendEliver" <${process.env.GMAIL_USER}>`,
        to: finalRecipient,
        subject: finalSubject,
        html: htmlContent,
        text: this.htmlToText(htmlContent), // Fallback text version
      };

      // Log what's happening
      if (isProduction) {
        console.log(`📧 [PRODUCTION] Sending email to: ${options.to}`);
      } else {
        console.log(`📧 [DEVELOPMENT] Original recipient: ${options.to}`);
        console.log(`📧 [DEVELOPMENT] Redirected to TEST_EMAIL: ${finalRecipient}`);
        console.log(`📧 [DEVELOPMENT] Subject prefixed with [DEV]`);
      }

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Email sent successfully to ${finalRecipient}`);
      console.log(`📧 Message ID: ${info.messageId}`);
      
    } catch (error) {
      console.error(`❌ Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  private renderTemplate(template: string, context: Record<string, any>): string {
    if (template === 'email-verification') {
      return `
        <!DOCTYPE html>
        <html lang="sk">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Overte svoj SendEliver účet</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 10px;
                    padding: 30px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 32px;
                    font-weight: bold;
                    color: #2563eb;
                    margin-bottom: 10px;
                }
                .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    color: white !important;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    margin: 20px 0;
                    font-size: 16px;
                }
                .code-box {
                    background: #f0f9ff;
                    border: 2px solid #2563eb;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    margin: 25px 0;
                }
                .code {
                    font-size: 28px;
                    font-weight: bold;
                    color: #2563eb;
                    letter-spacing: 4px;
                    font-family: 'Courier New', monospace;
                }
                .warning {
                    background: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .footer {
                    margin-top: 40px;
                    font-size: 14px;
                    color: #6b7280;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🚚 SendEliver</div>
                    <h1>Overte svoj účet</h1>
                </div>
                
                <p><strong>Dobrý deň ${context.displayName || 'používateľ'},</strong></p>
                
                <p>Vitajte v SendEliver! Pre aktiváciu vášho účtu prosím overte svoju emailovú adresu.</p>
                
                <div style="text-align: center;">
                    <a href="${context.verificationLink}" class="button">
                        ✉️ Overiť emailovú adresu
                    </a>
                </div>
                
                <p><strong>Alebo použite tento kód:</strong></p>
                
                <div class="code-box">
                    <div class="code">${context.verificationCode}</div>
                </div>
                
                <div class="warning">
                    <strong>⏰ Dôležité:</strong> Kód vyprší za ${context.expirationMinutes || 15} minút.
                </div>
                
                <p>Ak ste si nevytvorili účet, ignorujte tento email.</p>
                
                <div class="footer">
                    <p><strong>S pozdravom,<br>SendEliver Team</strong></p>
                    <p>&copy; ${new Date().getFullYear()} SendEliver. Všetky práva vyhradené.</p>
                </div>
            </div>
        </body>
        </html>
      `;
    }
    
    return `<p>Template ${template} not found</p>`;
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Gmail connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Gmail connection test failed:', error);
      return false;
    }
  }
}

// Export singleton
export const simpleGmailService = new SimpleGmailService();

// Backward compatibility - same interface as before
export const sendEmail = async (options: { to: string; subject: string; template: string; context: Record<string, any> }) => {
  await simpleGmailService.sendEmail(options);
};

export const testEmailConnection = () => {
  return simpleGmailService.testConnection();
};

/*
SETUP INSTRUCTIONS (takes 2 minutes):

1. Enable 2-Factor Authentication on Gmail:
   - Go to https://myaccount.google.com/security
   - Turn on 2-Step Verification

2. Generate App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other" 
   - Enter "SendEliver" as app name
   - Copy the 16-character password (like: "abcd efgh ijkl mnop")

3. Add to .env:
   GMAIL_USER=your.email@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop

4. Install nodemailer:
   npm install nodemailer
   npm install -D @types/nodemailer

5. Replace SendGrid import in auth.controllers.ts:
   import { sendEmail } from '../services/gmail.simple.service.js';

BENEFITS:
✅ Works immediately - no complex setup
✅ Free - 500 emails per day limit
✅ Reliable - Gmail infrastructure  
✅ No domain verification needed
✅ No API keys management
✅ Familiar interface

LIMITS:
⚠️ 500 emails per day (more than enough for startup)
⚠️ Uses your personal Gmail (can create dedicated account)

ALTERNATIVE - Use company email:
If you have SMTP access to deutschmann.sk:
GMAIL_USER=noreply@deutschmann.sk
GMAIL_APP_PASSWORD=your_company_smtp_password

And change service from 'gmail' to:
host: 'mail.deutschmann.sk',
port: 587,
secure: false,
*/