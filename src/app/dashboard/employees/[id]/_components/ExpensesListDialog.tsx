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
import { Receipt } from "lucide-react";

interface ExpensesListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  monthYear: string;
  expenses: any[];
  totalExpenses: number;
}

export function ExpensesListDialog({
  isOpen,
  onClose,
  employeeName,
  monthYear,
  expenses,
  totalExpenses,
}: ExpensesListDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Current Month Expenses & Upad — {employeeName}
              </DialogTitle>
              <p className="text-xs text-gray-500">
                Detailed entries of salary advances, utilities, and medical expenses for {monthYear}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs flex justify-between items-center">
          <span className="text-amber-900 font-medium">
            Total {expenses.length} Expense / Advance Entries Logged
          </span>
          <span className="text-sm font-bold text-amber-950">
            Total: ₹{totalExpenses.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg mt-2">
          <Table>
            <TableHeader className="bg-gray-50 sticky top-0">
              <TableRow>
                <TableHead className="w-28">Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-gray-400 text-xs">
                    No expenses or advances logged for this employee this month.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((exp, idx) => {
                  const dateStr = new Date(exp.expenseDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const amountNum = parseFloat(exp.amount) || 0;

                  return (
                    <TableRow key={exp.id || idx} className="text-xs">
                      <TableCell className="font-medium text-gray-900">{dateStr}</TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-800">
                          {exp.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700">{exp.description}</TableCell>
                      <TableCell className="text-right font-semibold text-amber-700">
                        ₹{amountNum.toLocaleString("en-IN")}
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

