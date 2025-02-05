// File: src/components/sections/content/search-forms/SuggestionList.tsx
// Last change: Updated suggestion list to use base dropdown

import React from 'react';
import { BaseDropdown } from './BaseDropdown';
import type { LocationSuggestion } from '@/types/location.types';

interface SuggestionListProps {
  isOpen: boolean;
  suggestions: LocationSuggestion[];
  onSelect: (suggestion: LocationSuggestion) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  className?: string;
}

export function SuggestionList({
  isOpen,
  suggestions,
  onSelect,
  hasMore,
  onLoadMore,
  inputRef,
  className
}: SuggestionListProps) {
  return (
    <BaseDropdown
      items={suggestions}
      isOpen={isOpen}
      onSelect={(item) => onSelect(item)}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      inputRef={inputRef}
      className={className}
      renderItem={(suggestion, isHighlighted) => (
        <div className={`suggestion-item ${isHighlighted ? 'highlighted' : ''}`}>
          <img
            src={suggestion.flagUrl}
            alt={`${suggestion.countryCode} flag`}
            className="country-flag-small"
          />
          <span className="postal-code">{suggestion.postalCode}</span>
          <span className="city-name">{suggestion.city}</span>
        </div>
      )}
    />
  );
}