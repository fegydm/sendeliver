// File: front/src/shared/elements/status-chip.element.tsx
// Last change: Updated import path to use common/ shared config

import React from "react";
import { VEHICLE_STATUS_CONFIG } from '@common/configs/vehicle-status.config';
import { useTranslationsPreload } from '@/hooks/useTranslationsPreload';

interface StatusChipProps {
  status: string;
  className?: string;
}

/**
 * Universal status chip component
 * Supports vehicle statuses, team statuses, site statuses etc.
 * Uses external config from common/ shared between FE+BE
 * Integrates with custom 100-language system via useTranslationsPreload
 */
export const StatusChip: React.FC<StatusChipProps> = ({ 
  status, 
  className = "" 
}) => {
  // Use your custom translation system
  // Note: You'll need to pass primaryLc, secondaryLc from context or props
  const { t } = useTranslationsPreload({
    primaryLc: 'sk', // TODO: Get from user context/settings
    secondaryLc: 'en', // TODO: Get from user context/settings
    enabled: true
  });
  
  // Get config for this status, fallback to INACTIVE if not found
  const config = VEHICLE_STATUS_CONFIG[status as keyof typeof VEHICLE_STATUS_CONFIG] 
    || VEHICLE_STATUS_CONFIG.INACTIVE;

  return (
    <span 
      className={`status-chip status-chip--${config.key.toLowerCase()} ${className}`.trim()}
      style={{ 
        color: config.color, 
        backgroundColor: config.bgColor 
      }}
      title={t(config.labelKey)}
    >
      <span className="status-chip__icon">{config.icon}</span>
      <span className="status-chip__label">{t(config.labelKey)}</span>
    </span>
  );
};

export default StatusChip;