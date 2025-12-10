"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Sector,
} from "recharts";

interface DashboardChartsProps {
  barChartData: { name: string; count: number; color: string }[];
  pieChartData: { name: string; value: number; color: string }[];
  lineChartData: { month: string; Credit: number; Debit: number }[];
}

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

// Enhanced tooltip with better styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div 
            key={`tooltip-${index}`} 
            className="flex items-center gap-2 text-sm"
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color || entry.stroke }}
            ></div>
            <span className="font-medium">{entry.name}:</span>
            <span className="font-semibold">
              {entry.dataKey === "count"
                ? entry.value
                : formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Active sector for pie chart
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        fill={fill}
      />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#333" fontSize={16} fontWeight={500}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#333" fontSize={14}>
        {formatCurrency(value)}
      </text>
      <text x={cx} y={cy + 25} textAnchor="middle" fill="#666" fontSize={12}>
        {`(${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

export default function DashboardCharts({
  barChartData,
  pieChartData,
  lineChartData,
}: DashboardChartsProps) {
  // State for active pie chart sector
  const [activeIndex, setActiveIndex] = useState(0);

  // Process line chart data
  const processedLineChartData = useMemo(() => {
    // Convert month string to Date objects for proper sorting
    const monthOrder = lineChartData.map((item) => {
      const [month, year] = item.month.split(" ");
      const monthIndex = new Date(Date.parse(`${month} 1, ${year}`)).getTime();
      return { ...item, monthIndex };
    });

    // Sort by date (oldest to newest)
    return monthOrder
      .sort((a, b) => a.monthIndex - b.monthIndex)
      .map(({ month, Credit, Debit }) => ({
        month,
        Credit,
        Debit,
        Net: Debit - Credit,
      }));
  }, [lineChartData]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // Mobile-optimized charts layout
  return (
    <div className="space-y-6">
      {/* Revenue Trends - Line Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          Revenue Trends
        </h2>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={processedLineChartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
                angle={-35}
                textAnchor="end"
                height={60}
                tickMargin={10}
                padding={{ left: 5, right: 5 }}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${Math.abs(value) >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                align="center"
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: "15px" }}
              />
              <Line
                type="monotone"
                dataKey="Debit"
                name="Income"
                stroke="#15803D"
                strokeWidth={3}
                dot={{ r: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
              <Line
                type="monotone"
                dataKey="Credit"
                name="Expense"
                stroke="#4F46E5"
                strokeWidth={3}
                dot={{ r: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
              <Line
                type="monotone"
                dataKey="Net"
                name="Net"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                animationDuration={1800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Small charts - grid for tablets/desktop, stack for mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Distribution - Interactive Donut Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Revenue Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  onMouseEnter={onPieEnter}
                  animationDuration={1200}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {pieChartData.map((entry, index) => (
              <div 
                key={`legend-${index}`} 
                className="flex items-center gap-2"
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invoices - Gradient Bar Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Pending Invoices
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 10, right: 0, left: 0, bottom: 20 }}
                barGap={30}
              >
                <defs>
                  {barChartData.map((entry, index) => (
                    <linearGradient
                      key={`gradient-${index}`}
                      id={`gradient-${entry.name}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                      <stop offset="100%" stopColor={entry.color} stopOpacity={0.4} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle"
                  iconSize={8}
                  verticalAlign="top"
                  align="right"
                />
                <Bar
                  dataKey="count"
                  name="Pending Count"
                  radius={[8, 8, 0, 0]}
                  barSize={60}
                  animationDuration={1500}
                >
                  {barChartData.map((entry) => (
                    <Cell 
                      key={`cell-${entry.name}`} 
                      fill={`url(#gradient-${entry.name})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}