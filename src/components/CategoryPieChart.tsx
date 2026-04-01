import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { IconSymbol } from './IconSymbol';
import type { CategoryInsight } from '../hooks/useCategoryInsights';

interface CategoryPieChartProps {
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

export function CategoryPieChart({ categories, loading, type }: CategoryPieChartProps) {
  if (loading && categories.length === 0) {
    return (
      <div className="h-[180px] flex items-center justify-center">
        <p className="text-[#8B8B8B]">Loading...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="h-[180px] flex items-center justify-center">
        <p className="text-[#8B8B8B]">No data available</p>
      </div>
    );
  }

  const chartData = categories.map((cat) => ({
    name: cat.name,
    value: cat.amount,
    percentage: cat.percentage,
    icon: cat.icon,
    id: cat.id
  }));

  const total = categories.reduce((sum, cat) => sum + cat.amount, 0);
  const color = type === 'income' ? '#B4DE00' : '#FF4D4D';

  return (
    <div>
      <div className="h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.id}`}
                  fill={COLORS[chartData.indexOf(entry) % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#262727',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
              labelStyle={{ color: '#FFFEFF', fontWeight: 600 }}
              itemStyle={{ color: '#8B8B8B' }}
              formatter={(value) => [
                formatCurrency(Number(value)),
                ''
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-between px-2">
        <span className="text-[12px] text-[#8F9091]">
          Total: <span className="font-mono-numbers font-semibold" style={{ color }}>{formatCurrency(total)}</span>
        </span>
        <span className="text-[12px] text-[#8F9091]">
          {categories.length} categories
        </span>
      </div>

      <div className="mt-4 space-y-2 max-h-[160px] overflow-y-auto">
        {categories.slice(0, 5).map((cat, index) => (
          <div key={cat.id} className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-[8px] flex items-center justify-center"
              style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}
            >
              <IconSymbol
                name={cat.icon || 'apps'}
                size={16}
                color={COLORS[index % COLORS.length]}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-brand-text truncate">
                {cat.name}
              </p>
              <p className="text-[11px] text-[#8F9091]">
                {cat.transactionCount} transaction{cat.transactionCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-semibold font-mono-numbers" style={{ color }}>
                {formatCurrency(cat.amount)}
              </p>
              <p className="text-[11px] text-[#8F9091]">
                {cat.percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
