// File: src/shared/types/shared.recharts.d.types.ts
import { ComponentType, ExoticComponent } from 'react';
import { Props as RechartsProps } from 'recharts';

declare module 'recharts' {
  export const ResponsiveContainer: ExoticComponent<RechartsProps>;
  export const BarChart: ExoticComponent<RechartsProps>;
  export const LineChart: ExoticComponent<RechartsProps>;
  export const PieChart: ExoticComponent<RechartsProps>;
  export const Bar: ExoticComponent<RechartsProps>;
  export const Line: ExoticComponent<RechartsProps>;
  export const Pie: ExoticComponent<RechartsProps>;
  export const XAxis: ExoticComponent<RechartsProps>;
  export const YAxis: ExoticComponent<RechartsProps>;
  export const CartesianGrid: ExoticComponent<RechartsProps>;
  export const Tooltip: ExoticComponent<RechartsProps>;
  export const Legend: ExoticComponent<RechartsProps>;
  export const Cell: ExoticComponent<RechartsProps>;
  export const Area: ExoticComponent<RechartsProps>;
  export const AreaChart: ExoticComponent<RechartsProps>;
  export const ComposedChart: ExoticComponent<RechartsProps>;
}