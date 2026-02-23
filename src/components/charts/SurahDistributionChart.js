import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import ChartCard from '../ChartCard';

const COLORS_LIGHT = ['#10b981', '#3b82f6', '#f59e0b', '#d1d5db'];
const COLORS_DARK = ['#34d399', '#60a5fa', '#fbbf24', '#4b5563'];

export default function SurahDistributionChart({ data, title = 'توزيع السور' }) {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS_DARK : COLORS_LIGHT;
  const filtered = data?.filter(d => d.value > 0) || [];

  if (filtered.length === 0) return null;

  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={filtered}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            dataKey="value"
            nameKey="name"
            paddingAngle={3}
          >
            {filtered.map((entry, i) => {
              const originalIndex = data.findIndex(d => d.key === entry.key || d.name === entry.name);
              return <Cell key={i} fill={colors[originalIndex] || colors[i % colors.length]} />;
            })}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : '#fff',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              direction: 'rtl',
              fontFamily: 'inherit',
            }}
            formatter={(value) => [value, '']}
          />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ direction: 'rtl', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
