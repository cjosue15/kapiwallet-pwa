import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { IconSymbol } from './IconSymbol';
import type { CategoryInsight } from '../hooks/useCategoryInsights';

interface CategoryBarChartProps {
  categories: CategoryInsight[];
  loading: boolean;
  type: 'income' | 'expense';
}

const COLORS = [
  '#B4DE00', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3',
  '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA', '#FFAAA5'
];

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

export function CategoryBarChart({ categories, loading, type }: CategoryBarChartProps) {
  if (loading && categories.length === 0) {
    return (
      <div className="h-[120px] flex items-center justify-center">
        <p className="text-[#8B8B8B]">Loading...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="h-[120px] flex items-center justify-center">
        <p className="text-[#8B8B8B]">No data available</p>
      </div>
    );
  }

  const chartData = categories.slice(0, 6).map((cat) => ({
    name: cat.name.length > 12 ? cat.name.substring(0, 12) + '...' : cat.name,
    fullName: cat.name,
    value: cat.amount,
    percentage: cat.percentage,
    icon: cat.icon,
    id: cat.id,
    transactions: cat.transactionCount
  }));

  const total = categories.reduce((sum, cat) => sum + cat.amount, 0);
  const color = type === 'income' ? '#B4DE00' : '#FF4D4D';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-[12px] text-[#8F9091]">
          Total: <span className="font-mono-numbers font-semibold" style={{ color }}>{formatCurrency(total)}</span>
        </span>
        <span className="text-[12px] text-[#8F9091]">
          {categories.length} categories
        </span>
      </div>

      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8B8B8B', fontSize: 10 }}
              tickFormatter={(value) => `S/ ${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0)}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8B8B8B', fontSize: 11 }}
              width={65}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#262727',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
              labelStyle={{ color: '#FFFEFF', fontWeight: 600 }}
              itemStyle={{ color: '#8B8B8B' }}
              formatter={(value) => [formatCurrency(Number(value)), '']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
            />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              maxBarSize={16}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.id}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {chartData.map((item, index) => (
          <div key={item.id} className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}
            >
              <IconSymbol
                name={item.icon || 'apps'}
                size={14}
                color={COLORS[index % COLORS.length]}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-brand-text truncate">
                {item.fullName}
              </p>
              <p className="text-[10px] text-[#8F9091]">
                {item.transactions} transaction{item.transactions !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[12px] font-semibold font-mono-numbers" style={{ color }}>
                {formatCurrency(item.value)}
              </p>
              <p className="text-[10px] text-[#8F9091]">
                {item.percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
