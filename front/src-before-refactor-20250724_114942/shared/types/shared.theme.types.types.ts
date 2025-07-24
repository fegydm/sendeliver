// File: src/shared/types/shared.theme.types.types.ts

export interface Theme {
  id: string; // ID is now required for identifying themes
  name: string; // Name for properties like "Navbar", "Banner"
  none_value?: string;
  default_value?: string;
  test_value?: string;
  custom_value?: string;
}
