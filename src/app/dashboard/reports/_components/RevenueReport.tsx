"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

export default function RevenueReport({
  dateRange,
  setDateRange,
  report = null,
}: {
  dateRange: [Date | null, Date | null];
  setDateRange: (dateRange: [Date | null, Date | null]) => void;
  report: any;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
      {/* Header & Global Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Overview</h2>
          <p className="text-sm text-slate-500">
            Financial summary for selected period
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-full md:w-auto">
          <Calendar className="w-4 h-4 text-slate-500" />
          <DatePicker
            selectsRange
            startDate={dateRange[0]}
            endDate={dateRange[1]}
            onChange={(update) =>
              setDateRange(update as [Date | null, Date | null])
            }
            dateFormat="MMM dd, yyyy"
            maxDate={new Date()}
            className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 w-full md:w-[200px] cursor-pointer"
            placeholderText="Select date range"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {report && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-center">
            <span className="text-xs md:text-sm text-slate-500 font-medium">
              Debit Total
            </span>
            <span className="text-lg md:text-2xl font-bold text-slate-800 mt-1">
              ₹{Number(report.debitTotal).toLocaleString("en-In")}
            </span>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-center">
            <span className="text-xs md:text-sm text-slate-500 font-medium">
              Credit Total
            </span>
            <span className="text-lg md:text-2xl font-bold text-slate-800 mt-1">
              ₹{Number(report.creditTotal).toLocaleString("en-In")}
            </span>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-center">
            <span className="text-xs md:text-sm text-slate-500 font-medium">
              Expenses
            </span>
            <span className="text-lg md:text-2xl font-bold text-red-600 mt-1">
              ₹{Number(report.expensesTotal).toLocaleString("en-In")}
            </span>
          </div>
          <div className="p-4 bg-primary-50 border border-primary-100 rounded-xl flex flex-col justify-center">
            <span className="text-xs md:text-sm text-primary-700 font-medium">
              Net Revenue
            </span>
            <span className="text-lg md:text-2xl font-bold text-primary-700 mt-1">
              ₹{Number(report.netRevenue).toLocaleString("en-In")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
