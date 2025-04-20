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
  ResponsiveContainer,
  ResponsiveContainerProps,
  ChartProps,
  LineProps,
  BarProps,
  AreaProps
} from 'recharts';

// Sample data - Replace with actual API data later
const dailyData = [
  { time: '00:00', orders: 4 },
  { time: '04:00', orders: 3 },
  { time: '08:00', orders: 7 },
  { time: '12:00', orders: 12 },
  { time: '16:00', orders: 16 },
  { time: '20:00', orders: 8 },
];

const monthlyData = [
  { month: 'Jan', orders: 150 },
  { month: 'Feb', orders: 230 },
  { month: 'Mar', orders: 280 },
  { month: 'Apr', orders: 320 },
  { month: 'May', orders: 400 },
  { month: 'Jun', orders: 380 },
];

const userGrowthData = [
  { date: '2024-01', users: 1200 },
  { date: '2024-02', users: 1900 },
  { date: '2024-03', users: 2400 },
  { date: '2024-04', users: 3100 },
  { date: '2024-05', users: 3800 },
  { date: '2024-06', users: 4500 },
];

const topProductsData = [
  { name: 'Organic Apples', sales: 1200 },
  { name: 'Fresh Tomatoes', sales: 900 },
  { name: 'Carrots', sales: 800 },
  { name: 'Potatoes', sales: 700 },
  { name: 'Lettuce', sales: 600 },
];

export const DailyTransactionChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={dailyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="orders" stroke="#10B981" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const MonthlyTrendChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="orders" fill="#10B981" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const UserGrowthChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={userGrowthData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="users" stroke="#10B981" fill="#D1FAE5" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const TopProductsChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={topProductsData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" />
        <Tooltip />
        <Legend />
        <Bar dataKey="sales" fill="#10B981" />
      </BarChart>
    </ResponsiveContainer>
  );
}; 