import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area,
  ResponsiveContainer 
} from 'recharts';

declare module 'recharts' {
  export interface ChartProps {
    data?: any[];
    width?: number | string;
    height?: number | string;
    layout?: 'horizontal' | 'vertical';
    children?: React.ReactNode;
  }

  export interface AxisProps {
    dataKey?: string;
    type?: 'number' | 'category';
    children?: React.ReactNode;
  }

  export interface LineProps {
    type?: string;
    dataKey: string;
    stroke?: string;
    children?: React.ReactNode;
  }

  export interface BarProps {
    dataKey: string;
    fill?: string;
    children?: React.ReactNode;
  }

  export interface AreaProps {
    type?: string;
    dataKey: string;
    stroke?: string;
    fill?: string;
    children?: React.ReactNode;
  }

  export interface ResponsiveContainerProps {
    width: string | number;
    height: string | number;
    children?: React.ReactNode;
  }

  export interface CartesianGridProps {
    strokeDasharray?: string;
    children?: React.ReactNode;
  }

  export interface TooltipProps {
    children?: React.ReactNode;
  }

  export interface LegendProps {
    children?: React.ReactNode;
  }

  export class LineChart extends React.Component<ChartProps> {}
  export class BarChart extends React.Component<ChartProps> {}
  export class AreaChart extends React.Component<ChartProps> {}
  export class XAxis extends React.Component<AxisProps> {}
  export class YAxis extends React.Component<AxisProps> {}
  export class CartesianGrid extends React.Component<CartesianGridProps> {}
  export class Tooltip extends React.Component<TooltipProps> {}
  export class Legend extends React.Component<LegendProps> {}
  export class Line extends React.Component<LineProps> {}
  export class Bar extends React.Component<BarProps> {}
  export class Area extends React.Component<AreaProps> {}
  export class ResponsiveContainer extends React.Component<ResponsiveContainerProps> {}
} 