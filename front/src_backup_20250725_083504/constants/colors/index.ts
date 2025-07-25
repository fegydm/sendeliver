// ./front/src/constants/colors/index.ts
import { base } from './base';
import { semantic } from './semantic';
import { components } from './components';
import type { ColorSystem, ThemeMode } from './types';

const colors: ColorSystem = {
  ...base,
  semantic,
  components,
};

export { base, semantic, components };
export type { ColorSystem, ThemeMode };
export default colors;