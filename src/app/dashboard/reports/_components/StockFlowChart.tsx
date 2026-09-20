"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface StockFlowItem {
  item: string;
  date: string;
  creditQty: number; // Stock came in
  debitQty: number;  // Stock went out
  unit: string;
}

export default function StockFlowChart({ data }: { data: StockFlowItem[] }) {
  const [selectedItem, setSelectedItem] = useState<string>("all");

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Stock Flow Movement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            No stock movement data available for the selected dates.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get unique item names
  const itemNames = Array.from(new Set(data.map((d) => d.item)));

  // Filter data by item name if selected
  const filteredData = selectedItem === "all" ? data : data.filter((d) => d.item === selectedItem);

  // Group by date
  const dateGrouped: Record<string, { date: string; creditQty: number; debitQty: number }> = {};
  filteredData.forEach((d) => {
    if (!dateGrouped[d.date]) {
      dateGrouped[d.date] = { date: d.date, creditQty: 0, debitQty: 0 };
    }
    dateGrouped[d.date].creditQty += d.creditQty;
    dateGrouped[d.date].debitQty += d.debitQty;
  });

  const chartData = Object.values(dateGrouped).sort((a, b) => (a.date > b.date ? 1 : -1));

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-2">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">Stock Flow Movement Graph</CardTitle>
          <p className="text-xs text-gray-500">Credit Invoice (+) Stock Came In vs Debit Invoice (-) Product Went Out</p>
        </div>
        <div className="w-48">
          <Select value={selectedItem} onValueChange={setSelectedItem}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="All Items" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              {itemNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: any) => [`${value} Units`, ""]}
                contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="creditQty" name="Credit (Stock In +)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="debitQty" name="Debit (Stock Out -)" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

