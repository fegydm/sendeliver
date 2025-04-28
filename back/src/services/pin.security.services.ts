// File: ./back/src/services/pin.security.services.ts
// Last change: Implemented PIN verification with security logging

import { pool } from '../configs/db.js';
import { logger } from '@sendeliver/logger';

export interface PinAttemptData {
  domain: string;
  pin: string;
  deviceInfo: {
    userAgent: string;
    language: string;
    screenSize: string;
    timeZone: string;
    platform: string;
    doNotTrack: string | null;
    cookieEnabled: boolean;
    typingPattern: number[];
  };
  ipAddress: string;
}

export class PinSecurityService {
  /**
   * Verify PIN for specified domain
   */
  public async verifyPin(data: PinAttemptData): Promise<boolean> {
    try {
      // Log attempt to database for security analysis
      await this.logPinAttempt(data);
      
      // Get correct PIN from database
      const query = `
        SELECT pin, max_attempts, lockout_minutes
        FROM security.domain_pins
        WHERE domain = $1
      `;
      
      const result = await pool.query(query, [data.domain]);
      
      if (result.rows.length === 0) {
        logger.warn(`No PIN configuration found for domain: ${data.domain}`);
        return false;
      }
      
      const { pin: correctPin, max_attempts, lockout_minutes } = result.rows[0];
      
      // Check if domain is currently locked out
      const isLocked = await this.isDomainLocked(data.domain, max_attempts, lockout_minutes);
      if (isLocked) {
        logger.warn(`PIN attempt for locked domain: ${data.domain}`);
        return false;
      }
      
      // Verify PIN
      const isCorrect = data.pin === correctPin;
      
      // If correct, reset consecutive failed attempts
      if (isCorrect) {
        await this.resetFailedAttempts(data.domain);
        logger.info(`Successful PIN verification for domain: ${data.domain}`);
      } else {
        logger.warn(`Failed PIN verification for domain: ${data.domain}`);
      }
      
      return isCorrect;
    } catch (error) {
      logger.error('Error in PIN verification:', error);
      return false;
    }
  }
  
  /**
   * Log PIN attempt to database for security analysis
   */
  private async logPinAttempt(data: PinAttemptData): Promise<void> {
    try {
      const query = `
        INSERT INTO security.pin_attempts (
          domain,
          ip_address,
          user_agent,
          is_successful,
          device_info,
          typing_pattern
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      
      // We don't know yet if it's successful
      const isSuccessful = null;
      
      // Prepare device info as JSON
      const deviceInfoJson = JSON.stringify({
        language: data.deviceInfo.language,
        screenSize: data.deviceInfo.screenSize,
        timeZone: data.deviceInfo.timeZone,
        platform: data.deviceInfo.platform,
        doNotTrack: data.deviceInfo.doNotTrack,
        cookieEnabled: data.deviceInfo.cookieEnabled
      });
      
      await pool.query(query, [
        data.domain,
        data.ipAddress,
        data.deviceInfo.userAgent,
        isSuccessful,
        deviceInfoJson,
        JSON.stringify(data.deviceInfo.typingPattern)
      ]);
      
      logger.debug(`Logged PIN attempt for domain: ${data.domain}`);
    } catch (error) {
      logger.error('Error logging PIN attempt:', error);
      // We don't throw so the main verification flow can continue
    }
  }
  
  /**
   * Update PIN attempt result after verification
   */
  public async updatePinAttemptResult(domain: string, ipAddress: string, isSuccessful: boolean): Promise<void> {
    try {
      const query = `
        UPDATE security.pin_attempts
        SET is_successful = $3
        WHERE domain = $1 AND ip_address = $2
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      await pool.query(query, [domain, ipAddress, isSuccessful]);
    } catch (error) {
      logger.error('Error updating PIN attempt result:', error);
    }
  }
  
  /**
   * Check if domain is currently locked out due to too many failed attempts
   */
  private async isDomainLocked(domain: string, maxAttempts: number, lockoutMinutes: number): Promise<boolean> {
    try {
      const query = `
        SELECT COUNT(*) as failed_count
        FROM security.pin_attempts
        WHERE domain = $1
          AND is_successful = false
          AND created_at > NOW() - INTERVAL '${lockoutMinutes} minutes'
      `;
      
      const result = await pool.query(query, [domain]);
      const failedCount = parseInt(result.rows[0].failed_count);
      
      return failedCount >= maxAttempts;
    } catch (error) {
      logger.error('Error checking domain lockout status:', error);
      return false; // Default to not locked in case of error
    }
  }
  
  /**
   * Reset consecutive failed attempts after successful verification
   */
  private async resetFailedAttempts(domain: string): Promise<void> {
    try {
      // We don't actually delete attempts, just mark that a successful attempt occurred
      const query = `
        INSERT INTO security.pin_attempts (
          domain,
          ip_address,
          user_agent,
          is_successful,
          device_info
        )
        VALUES ($1, 'reset', 'reset', true, '{}')
      `;
      
      await pool.query(query, [domain]);
    } catch (error) {
      logger.error('Error resetting failed attempts:', error);
    }
  }
  
  /**
   * Get suspicious activity report
   */
  public async getSuspiciousActivity(): Promise<any[]> {
    try {
      const query = `
        WITH ip_stats AS (
          SELECT 
            ip_address,
            COUNT(*) as attempt_count,
            COUNT(CASE WHEN is_successful = false THEN 1 END) as failed_count,
            COUNT(DISTINCT domain) as domain_count
          FROM security.pin_attempts
          WHERE created_at > NOW() - INTERVAL '24 hours'
          GROUP BY ip_address
        )
        SELECT *
        FROM ip_stats
        WHERE failed_count > 5 OR domain_count > 2
        ORDER BY attempt_count DESC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error generating suspicious activity report:', error);
      return [];
    }
  }
}

export default new PinSecurityService();