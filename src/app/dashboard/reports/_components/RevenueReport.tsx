"use client";

import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function ReportsReport({
  dateRange,
  setDateRange,
  report = null,
}: {
  dateRange: [Date | null, Date | null];
  setDateRange: (dateRange: [Date | null, Date | null]) => void;
  report: any;
}) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Revenue Report</h1>

      {/* Date Range Selector */}
      <DatePicker
        selectsRange
        startDate={dateRange[0]}
        endDate={dateRange[1]}
        onChange={(update) =>
          setDateRange(update as [Date | null, Date | null])
        }
        dateFormat="MMM dd, yyyy"
        maxDate={new Date()}
        className="border rounded-md px-3 py-2 mb-4"
      />

      {/* Summary Cards */}
      {report && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white shadow rounded">
            Debit Total: {Number(report.debitTotal).toLocaleString("en-In")}
          </div>
          <div className="p-4 bg-white shadow rounded">
            Credit Total: {Number(report.creditTotal).toLocaleString("en-In")}
          </div>
          <div className="p-4 bg-white shadow rounded">
            Expenses: {Number(report.expensesTotal).toLocaleString("en-In")}
          </div>
          <div className="p-4 bg-white shadow rounded">
            Net Revenue: {report.netRevenue.toLocaleString("en-In")}
          </div>
        </div>
      )}
    </div>
  );
}
