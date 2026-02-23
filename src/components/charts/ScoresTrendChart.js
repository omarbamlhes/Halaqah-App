import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import ChartCard from '../ChartCard';

export default function ScoresTrendChart({ data }) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) return null;

  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#9ca3af' : '#6b7280';

  return (
    <ChartCard title="تطور الدرجات" className="md:col-span-2">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="label"
            reversed
            tick={{ fill: textColor, fontSize: 11 }}
            axisLine={{ stroke: gridColor }}
          />
          <YAxis
            orientation="right"
            domain={[0, 10]}
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
          <Line type="monotone" dataKey="hifdh" name="الحفظ" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="tajweed" name="التجويد" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="fluency" name="الطلاقة" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
