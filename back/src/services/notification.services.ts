// File: ./back/src/services/notification.services.ts
// Last change: Implementation of notification service for contact messages

import { logger } from '@sendeliver/logger';
import { WebSocketManager } from '../configs/websocket.config.js';
import { sendEmail } from '../utils/email.utils.js';
import { ContactMessage } from '../services/contact.messages.services.js';

export class NotificationService {
  private static instance: NotificationService;
  private adminEmails: string[] = [];
  
  private constructor() {
    // Initialize with default admin emails from environment variables or config
    const configEmails = process.env.ADMIN_EMAILS || 'admin@sendeliver.com';
    this.adminEmails = configEmails.split(',').map(email => email.trim());
  }
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  /**
   * Set admin emails that will receive notifications
   */
  public setAdminEmails(emails: string[]): void {
    this.adminEmails = emails;
  }
  
  /**
   * Add a single admin email
   */
  public addAdminEmail(email: string): void {
    if (!this.adminEmails.includes(email)) {
      this.adminEmails.push(email);
    }
  }
  
  /**
   * Send a real-time notification to all connected admin clients
   */
  public async sendRealTimeNotification(
    type: 'new_message' | 'status_update',
    data: Partial<ContactMessage>
  ): Promise<void> {
    try {
      // Send to all connected admin clients
      WebSocketManager.broadcastToAdmins({
        type: 'notification',
        payload: {
          type,
          data,
          timestamp: new Date().toISOString()
        }
      });
      
      logger.info(`Real-time notification sent for ${type}`);
    } catch (error) {
      logger.error('Error sending real-time notification:', error);
    }
  }
  
  /**
   * Send email notifications about new contact messages
   */
  public async sendNewMessageEmailAlert(message: Partial<ContactMessage>): Promise<void> {
    try {
      const emailPromises = this.adminEmails.map(adminEmail => {
        return sendEmail({
          to: adminEmail,
          subject: 'New Contact Message Received',
          template: 'admin-new-message',
          context: {
            message,
            adminDashboardUrl: `${process.env.FRONTEND_URL || 'https://sendeliver.com'}/admin/messages/${message.id}`
          }
        });
      });
      
      await Promise.all(emailPromises);
      logger.info(`Email alerts sent to ${this.adminEmails.length} administrators`);
    } catch (error) {
      logger.error('Error sending email alerts:', error);
    }
  }
  
  /**
   * Process a new contact message - send both real-time and email notifications
   */
  public async notifyNewContactMessage(message: Partial<ContactMessage>): Promise<void> {
    // Send real-time notification
    await this.sendRealTimeNotification('new_message', message);
    
    // Send email notification
    await this.sendNewMessageEmailAlert(message);
  }
}

export const notificationService = NotificationService.getInstance();