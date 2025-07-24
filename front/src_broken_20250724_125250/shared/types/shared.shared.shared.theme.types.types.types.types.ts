// File: shared/types/shared.shared.shared.theme.types.types.types.types.ts

export interface Theme {
  id: string; // ID is now required for identifying themes
  name: string; // Name for properties ike "Navbar", "Banner"
  none_value?: string;
  default_value?: string;
  test_value?: string;
  custom_value?: string;
}
