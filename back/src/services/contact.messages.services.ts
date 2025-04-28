// File: ./back/src/services/contact.messages.services.ts
// Last change: Initial implementation with database operations for contact messages

import { pool } from '../configs/db.js';
import { logger } from '@sendeliver/logger';

// Define interfaces for contact message
export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  ipAddress: string;
  userAgent: string;
}

export interface ContactMessage extends ContactMessageInput {
  id: number;
  status: 'new' | 'read' | 'replied' | 'spam';
  createdAt: Date;
  updatedAt: Date;
}

export class ContactService {
  /**
   * Create a new contact message
   */
  public async createContactMessage(data: ContactMessageInput): Promise<{ id: number }> {
    try {
      const query = `
        INSERT INTO contact.messages (
          name, 
          email, 
          subject, 
          message, 
          ip_address, 
          user_agent, 
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'new')
        RETURNING id
      `;
      
      const values = [
        data.name,
        data.email,
        data.subject,
        data.message,
        data.ipAddress,
        data.userAgent
      ];
      
      const result = await pool.query(query, values);
      
      return { id: result.rows[0].id };
    } catch (error) {
      logger.error('Error creating contact message:', error);
      throw new Error('Failed to create contact message');
    }
  }
  
  /**
   * Get all contact messages
   */
  public async getAllContactMessages(): Promise<ContactMessage[]> {
    try {
      const query = `
        SELECT 
          id,
          name,
          email,
          subject,
          message,
          ip_address as "ipAddress",
          user_agent as "userAgent",
          status,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM contact.messages
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching contact messages:', error);
      throw new Error('Failed to fetch contact messages');
    }
  }
  
  /**
   * Get a single contact message by ID
   */
  public async getContactMessageById(id: number): Promise<ContactMessage | null> {
    try {
      const query = `
        SELECT 
          id,
          name,
          email,
          subject,
          message,
          ip_address as "ipAddress",
          user_agent as "userAgent",
          status,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM contact.messages
        WHERE id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error(`Error fetching contact message ID ${id}:`, error);
      throw new Error('Failed to fetch contact message');
    }
  }
  
  /**
   * Update contact message status
   */
  public async updateContactMessageStatus(id: number, status: 'new' | 'read' | 'replied' | 'spam'): Promise<ContactMessage | null> {
    try {
      const query = `
        UPDATE contact.messages
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING 
          id,
          name,
          email,
          subject,
          message,
          ip_address as "ipAddress",
          user_agent as "userAgent",
          status,
          created_at as "createdAt",
          updated_at as "updatedAt"
      `;
      
      const result = await pool.query(query, [status, id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error(`Error updating contact message ID ${id}:`, error);
      throw new Error('Failed to update contact message');
    }
  }
  
  /**
   * Send a confirmation email to the user
   * This is a placeholder method that can be implemented with your email service
   */
  public async sendConfirmationEmail(email: string, name: string): Promise<void> {
    try {
      // Implement your email sending logic here
      // Example:
      // await emailService.send({
      //   to: email,
      //   subject: 'Thank you for contacting us',
      //   template: 'contact-confirmation',
      //   data: { name }
      // });
      
      logger.info(`Confirmation email would be sent to ${email}`);
    } catch (error) {
      logger.error(`Error sending confirmation email to ${email}:`, error);
      // We don't throw an error here to prevent the main flow from failing
      // if email sending fails
    }
  }
}