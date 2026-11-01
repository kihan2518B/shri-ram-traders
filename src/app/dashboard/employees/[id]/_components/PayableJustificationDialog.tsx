"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calculator } from "lucide-react";

interface PayableJustificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  monthlySalary: string | number;
  daysInMonth: number;
  dailySalary: number;
  totalUnitsWorked: number;
  calculatedPayable: number;
  attendances: any[];
}

const STATUS_LABELS: Record<string, { label: string; color: string; factor: string }> = {
  FULL_DAY: { label: "Full Day", color: "text-emerald-700 bg-emerald-100", factor: "100% (1.0)" },
  THREE_QUARTER: { label: "3/4 Day", color: "text-sky-700 bg-sky-100", factor: "75% (0.75)" },
  HALF_DAY: { label: "Half Day", color: "text-amber-700 bg-amber-100", factor: "50% (0.50)" },
  QUARTER_DAY: { label: "1/4 Day", color: "text-orange-700 bg-orange-100", factor: "25% (0.25)" },
  ABSENT: { label: "Absent / Leave", color: "text-red-700 bg-red-100", factor: "0% (0.0)" },
};

export function PayableJustificationDialog({
  isOpen,
  onClose,
  employeeName,
  monthlySalary,
  daysInMonth,
  dailySalary,
  totalUnitsWorked,
  calculatedPayable,
  attendances,
}: PayableJustificationDialogProps) {
  const salaryNum = parseFloat(String(monthlySalary)) || 0;

  // Sort attendances ascending by date
  const sortedAttendances = [...attendances].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Salary Payable Justification — {employeeName}
              </DialogTitle>
              <p className="text-xs text-gray-500">
                Attendance-based wage breakdown for this month
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Formula Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-gray-500 block">Monthly Salary</span>
            <span className="font-bold text-gray-900 text-sm">₹{salaryNum.toLocaleString("en-IN")}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Days in Month</span>
            <span className="font-bold text-gray-900 text-sm">{daysInMonth} days</span>
          </div>
          <div>
            <span className="text-gray-500 block">Daily Rate</span>
            <span className="font-bold text-blue-700 text-sm">
              ₹{dailySalary.toLocaleString("en-IN")} / day
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">Attendance Units</span>
            <span className="font-bold text-emerald-700 text-sm">{totalUnitsWorked} Days</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex justify-between items-center">
          <span>
            <strong>Formula:</strong> ({totalUnitsWorked} worked units) × (₹{dailySalary} / day)
          </span>
          <span className="text-sm font-bold text-emerald-800">
            = ₹{calculatedPayable.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Table of Daily Records */}
        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg mt-2">
          <Table>
            <TableHeader className="bg-gray-50 sticky top-0">
              <TableRow>
                <TableHead className="w-28">Date</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Attendance Status</TableHead>
                <TableHead className="text-center">Factor</TableHead>
                <TableHead className="text-right">Daily Earning (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAttendances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-400 text-xs">
                    No attendance records marked for this month yet.
                  </TableCell>
                </TableRow>
              ) : (
                sortedAttendances.map((att, idx) => {
                  const dateObj = new Date(att.date);
                  const dateStr = dateObj.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const dayName = dateObj.toLocaleDateString("en-IN", { weekday: "short" });
                  const statusInfo = STATUS_LABELS[att.status] || {
                    label: att.status,
                    color: "text-gray-700 bg-gray-100",
                    factor: `${att.units * 100}% (${att.units})`,
                  };
                  const earned = Math.round(att.units * dailySalary);

                  return (
                    <TableRow key={att.id || idx} className="text-xs">
                      <TableCell className="font-medium text-gray-900">{dateStr}</TableCell>
                      <TableCell className="text-gray-500">{dayName}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        {att.note && <span className="block text-[10px] text-gray-400 mt-0.5">{att.note}</span>}
                      </TableCell>
                      <TableCell className="text-center font-mono text-gray-700">
                        {statusInfo.factor}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-emerald-700">
                        ₹{earned.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

