import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface MonthlyHistoryEntry {
  label: string;
  month: string;
  amount: number;
  income: number;
  expense: number;
}

interface MonthlyHistoryChartProps {
  entries: MonthlyHistoryEntry[];
  loading: boolean;
}

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1000) {
    return `S/ ${(value / 1000).toFixed(1)}k`;
  }
  return `S/ ${value.toFixed(0)}`;
};

export function MonthlyHistoryChart({ entries, loading }: MonthlyHistoryChartProps) {
  if (loading && entries.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <p className="text-[#8B8B8B]">Loading chart...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <p className="text-[#8B8B8B]">No data available</p>
      </div>
    );
  }

  const data = entries.slice(-6).map((entry) => ({
    month: entry.month,
    income: entry.income,
    expense: Math.abs(entry.expense),
    amount: entry.amount
  }));

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8B8B8B', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8B8B8B', fontSize: 10 }}
            tickFormatter={formatCurrency}
            width={50}
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
            formatter={(value) => [
              `S/ ${Number(value).toFixed(2)}`,
              value === 'income' ? 'Income' : 'Expense'
            ]}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
          <Bar
            dataKey="expense"
            fill="#FF4D4D"
            radius={[4, 4, 0, 0]}
            maxBarSize={20}
          />
          <Bar
            dataKey="income"
            fill="#B4DE00"
            radius={[4, 4, 0, 0]}
            maxBarSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
