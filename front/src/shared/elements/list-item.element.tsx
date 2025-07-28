// File: src/shared/elements/list-item.element.tsx
// Last change: Enhanced universal list item based on FleetItem with StatusChip integration

import React from "react";
import { StatusChip } from "./status-chip.element";

export interface ListItemData {
  id: string;
  name: string;
  image?: string;
  type?: string;
  status?: string;
  meta?: Array<string | React.ReactNode>;
  plateNumber?: string; // For vehicles
  email?: string; // For team members
  address?: string; // For sites
  city?: string; // For sites
}

export interface ListItemProps {
  item: ListItemData;
  isSelected: boolean;
  onClick: (item: ListItemData) => void;
  imageAlt?: string;
  fallbackImage?: string;
  className?: string;
  showImage?: boolean;
  showStatus?: boolean;
  renderMeta?: (item: ListItemData) => React.ReactNode;
}

/**
 * Universal list item component for sidebars
 * Used in Fleet (vehicles), Team (members), Sites (locations), Shipments etc.
 * Supports thumbnail image, name, type, status and custom meta information
 * Based on original FleetItem design pattern
 */
export const ListItem: React.FC<ListItemProps> = ({
  item,
  isSelected,
  onClick,
  imageAlt,
  fallbackImage = "/shared/placeholder.jpg",
  className = "",
  showImage = true,
  showStatus = true,
  renderMeta
}) => {
  const handleClick = () => {
    onClick(item);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = fallbackImage;
    target.classList.add("list-item__image--fallback");
  };

  const renderDefaultMeta = () => {
    const metaItems: React.ReactNode[] = [];
    
    // Add type if available
    if (item.type) {
      metaItems.push(<span key="type">{item.type}</span>);
    }
    
    // Add separator if we have type and status
    if (item.type && item.status && showStatus) {
      metaItems.push(<span key="separator" className="list-item__separator">•</span>);
    }
    
    // Add status chip if available and enabled
    if (item.status && showStatus) {
      metaItems.push(
        <StatusChip key="status" status={item.status} className="list-item__status-chip" />
      );
    }
    
    return metaItems;
  };

  return (
    <div 
      className={`list-item ${isSelected ? 'list-item--selected' : ''} ${className}`.trim()}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {showImage && (
        <div className="list-item__image-container">
          <img 
            src={item.image || fallbackImage}
            alt={imageAlt || item.name}
            className="list-item__image"
            onError={handleImageError}
            loading="lazy"
          />
        </div>
      )}
      
      <div className="list-item__content">
        <div className="list-item__name">{item.name}</div>
        
        <div className="list-item__meta">
          {renderMeta ? renderMeta(item) : renderDefaultMeta()}
        </div>
      </div>
    </div>
  );
};

export default ListItem;