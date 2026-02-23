import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import ChartCard from '../ChartCard';

export default function AttendanceChart({ data }) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) return null;

  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#9ca3af' : '#6b7280';

  return (
    <ChartCard title="حضور الطلاب" className="md:col-span-2">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="name"
            reversed
            tick={{ fill: textColor, fontSize: 11 }}
            axisLine={{ stroke: gridColor }}
          />
          <YAxis
            orientation="right"
            tick={{ fill: textColor, fontSize: 11 }}
            axisLine={{ stroke: gridColor }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : '#fff',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              direction: 'rtl',
              fontFamily: 'inherit',
            }}
          />
          <Legend wrapperStyle={{ direction: 'rtl', fontSize: '12px' }} />
          <Bar dataKey="present" name="حاضر" stackId="a" fill={isDark ? '#34d399' : '#10b981'} />
          <Bar dataKey="late" name="متأخر" stackId="a" fill={isDark ? '#fbbf24' : '#f59e0b'} />
          <Bar dataKey="excused" name="معذور" stackId="a" fill={isDark ? '#60a5fa' : '#3b82f6'} />
          <Bar dataKey="absent" name="غائب" stackId="a" fill={isDark ? '#f87171' : '#ef4444'} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
