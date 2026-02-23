import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import ChartCard from '../ChartCard';

export default function WeeklyPointsChart({ data }) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) return null;

  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#9ca3af' : '#6b7280';

  return (
    <ChartCard title="النقاط الأسبوعية">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="label"
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
            formatter={(value) => [value, 'نقطة']}
          />
          <Bar dataKey="points" name="النقاط" fill={isDark ? '#fbbf24' : '#f59e0b'} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
