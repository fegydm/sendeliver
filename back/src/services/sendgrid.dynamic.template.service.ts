// File: back/src/services/sendgrid.dynamic.template.service.ts
// Last change: Updated to use SendGrid Dynamic Templates instead of custom HTML

import sgMail from '@sendgrid/mail';

interface EmailOptions {
  to: string;
  templateId?: string; // Dynamic template ID
  dynamicData: Record<string, any>; // Data for template variables
}

interface SendGridDynamicConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  templateId: string; // Your default template ID
  isProduction: boolean;
}

class SendGridDynamicTemplateService {
  private config: SendGridDynamicConfig;
  private isInitialized: boolean = false;

  constructor() {
    this.config = this.loadConfig();
    this.initialize();
  }

  private loadConfig(): SendGridDynamicConfig {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY environment variable is required');
    }

    return {
      apiKey,
      fromEmail: process.env.FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL || 'noreply@sendeliver.com',
      fromName: process.env.FROM_NAME || 'SendEliver Team',
      templateId: process.env.SENDGRID_TEMPLATE_ID || 'd-c8e162fe66ac48cda555afd5137794fd',
      isProduction: process.env.EMAIL_MODE === 'production' || process.env.NODE_ENV === 'production',
    };
  }

  private initialize(): void {
    try {
      sgMail.setApiKey(this.config.apiKey);
      this.isInitialized = true;
      
      console.log(`✅ SendGrid Dynamic Templates initialized`);
      console.log(`📧 From: ${this.config.fromName} <${this.config.fromEmail}>`);
      console.log(`🎯 Default Template ID: ${this.config.templateId}`);
      console.log(`🎯 Mode: ${this.config.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize SendGrid:', error);
      throw error;
    }
  }

  async sendEmailWithTemplate(options: EmailOptions): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('SendGrid service not initialized');
    }

    try {
      const templateId = options.templateId || this.config.templateId;

      const msg = {
        to: options.to,
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        templateId: templateId,
        dynamicTemplateData: options.dynamicData,
        // Optional: Add tracking
        trackingSettings: {
          clickTracking: {
            enable: this.config.isProduction,
          },
          openTracking: {
            enable: this.config.isProduction,
          },
        },
        // Optional: Add categories for analytics
        categories: ['email-verification', 'sendeliver'],
      };

      if (this.config.isProduction) {
        // Send actual email in production
        const response = await sgMail.send(msg);
        console.log(`✅ Dynamic template email sent to ${options.to}`, {
          templateId: templateId,
          messageId: response[0].headers['x-message-id'],
          statusCode: response[0].statusCode,
        });
      } else {
        // Log email data in development mode
        console.log(`[DEV MODE] Dynamic template email would be sent to ${options.to}:`, {
          templateId: templateId,
          from: `${this.config.fromName} <${this.config.fromEmail}>`,
          dynamicData: options.dynamicData,
        });
        
        // Optionally send to test email in development
        if (process.env.TEST_EMAIL) {
          msg.to = process.env.TEST_EMAIL;
          // Add [DEV] prefix to subject if template has one
          if (options.dynamicData.subject) {
            options.dynamicData.subject = `[DEV] ${options.dynamicData.subject}`;
          }
          await sgMail.send(msg);
          console.log(`📧 Test email sent to ${process.env.TEST_EMAIL}`);
        }
      }

    } catch (error) {
      console.error(`❌ SendGrid Dynamic Template email failed for ${options.to}:`, error);
      
      // Enhanced error logging
      if (error && typeof error === 'object' && 'response' in error) {
        const sgError = error as any;
        console.error('SendGrid Error Details:', {
          statusCode: sgError.code,
          message: sgError.message,
          response: sgError.response?.body,
        });
      }
      
      throw error;
    }
  }

  // Verification email using dynamic template
  async sendVerificationEmail(to: string, displayName: string, verificationLink: string, verificationCode: string): Promise<void> {
    await this.sendEmailWithTemplate({
      to,
      dynamicData: {
        // These variables must match your SendGrid template
        displayName: displayName || 'používateľ',
        verificationLink: verificationLink,
        verificationCode: verificationCode,
        expirationMinutes: 15,
        // Optional: Add subject if your template supports it
        subject: 'Overte svoj SendEliver účet',
        // You can add more variables as needed by your template
        companyName: 'SendEliver',
        supportEmail: 'support@sendeliver.com',
        currentYear: new Date().getFullYear(),
      }
    });
  }

  // Generic notification email
  async sendNotificationEmail(to: string, templateId: string, templateData: Record<string, any>): Promise<void> {
    await this.sendEmailWithTemplate({
      to,
      templateId,
      dynamicData: templateData
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const testEmail = process.env.TEST_EMAIL;
      if (!testEmail) {
        console.log('⚠️ No TEST_EMAIL set, skipping connection test');
        return true;
      }

      await this.sendVerificationEmail(
        testEmail,
        'Test User',
        'https://sendeliver.com/test',
        'TEST123'
      );

      console.log('✅ SendGrid Dynamic Template connection test successful');
      return true;
    } catch (error) {
      console.error('❌ SendGrid Dynamic Template connection test failed:', error);
      return false;
    }
  }

  // Method to get template info (useful for debugging)
  getTemplateInfo(): { templateId: string; fromEmail: string; fromName: string } {
    return {
      templateId: this.config.templateId,
      fromEmail: this.config.fromEmail,
      fromName: this.config.fromName
    };
  }
}

// Export singleton instance
export const sendGridDynamicService = new SendGridDynamicTemplateService();

// Backward compatibility function - adapts old interface to new dynamic template
export const sendEmail = async (options: { to: string; subject: string; template: string; context: Record<string, any> }) => {
  // Map the old interface to dynamic template
  if (options.template === 'email-verification') {
    await sendGridDynamicService.sendVerificationEmail(
      options.to,
      options.context.displayName,
      options.context.verificationLink,
      options.context.verificationCode
    );
  } else {
    // For other templates, use generic method
    await sendGridDynamicService.sendEmailWithTemplate({
      to: options.to,
      dynamicData: {
        ...options.context,
        subject: options.subject
      }
    });
  }
};

// Export test function
export const testEmailConnection = () => {
  return sendGridDynamicService.testConnection();
};

/* 
SENDGRID DYNAMIC TEMPLATE SETUP:

1. In SendGrid Dashboard:
   - Go to Email API → Dynamic Templates
   - Click your template: d-c8e162fe66ac48cda555afd5137794fd
   - Edit the template content

2. Template Variables (use these in your template):
   {{displayName}} - User's name
   {{verificationLink}} - Full verification URL
   {{verificationCode}} - 6-character code  
   {{expirationMinutes}} - Expiration time (15)
   {{companyName}} - SendEliver
   {{supportEmail}} - support@sendeliver.com
   {{currentYear}} - Current year

3. Sample template content:
   Subject: Overte svoj {{companyName}} účet
   
   Body:
   Dobrý deň {{displayName}},
   
   Pre aktiváciu vášho účtu kliknite na tlačidlo:
   <a href="{{verificationLink}}">Overiť email</a>
   
   Alebo použite kód: {{verificationCode}}
   
   Kód vyprší za {{expirationMinutes}} minút.
   
   S pozdravom,
   {{companyName}} Team

4. Environment variables:
   SENDGRID_API_KEY=your_api_key
   SENDGRID_TEMPLATE_ID=d-c8e162fe66ac48cda555afd5137794fd
   FROM_EMAIL=noreply@sendeliver.com
   FROM_NAME=SendEliver Team
   EMAIL_MODE=development (or production)
   TEST_EMAIL=your@email.com

5. Usage:
   import { sendEmail } from './services/sendgrid.dynamic.template.service.js';
   
   await sendEmail({
     to: 'user@example.com',
     subject: 'ignored', // Subject is in template
     template: 'email-verification',
     context: {
       displayName: 'John Doe',
       verificationLink: 'https://...',
       verificationCode: '123456'
     }
   });

BENEFITS:
✅ Uses your existing Dynamic Template
✅ Professional email design via SendGrid editor
✅ No HTML/CSS coding needed
✅ Template versioning and A/B testing
✅ Built-in analytics and tracking
✅ Deliverability optimization by SendGrid
*/