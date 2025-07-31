// File: front/src/apps/hauler/context-menu.tabs.hauler.tsx
// Last change: Initial creation of the reusable context menu component.

import React, { useEffect } from 'react';

export interface ContextAction {
  label: string;
  action: () => void;
  isSeparator?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  actions: ContextAction[];
  onClose: () => void;
}

const ContextMenuTabsHauler: React.FC<ContextMenuProps> = ({ x, y, actions, onClose }) => {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [onClose]);

  return (
    <div
      className="context-menu"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      <ul className="context-menu__list">
        {actions.map((item, index) => {
          if (item.isSeparator) {
            return <hr key={`separator-${index}`} className="context-menu__divider" />;
          }
          return (
            <li
              key={index}
              className={`context-menu__item ${item.disabled ? 'context-menu__item--disabled' : ''}`}
              onClick={() => {
                if (!item.disabled) {
                  item.action();
                  onClose();
                }
              }}
            >
              {item.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ContextMenuTabsHauler;
