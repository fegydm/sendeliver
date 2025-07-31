// File: front/src/types/declarations/svg.d.ts
// Last change: Added missing SVG element types for React.

import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      conicGradient: React.SVGProps<SVGElement>;
    }
  }
}
