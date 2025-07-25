// ./front/src/constants/colors/types.ts
import type { BaseColors } from './base';
import type { SemanticColors } from './semantic';
import type { ComponentColors } from './components';

export interface ColorSystem extends BaseColors {
  semantic: SemanticColors;
  components: ComponentColors;
}

export type ThemeMode = 'light' | 'dark';