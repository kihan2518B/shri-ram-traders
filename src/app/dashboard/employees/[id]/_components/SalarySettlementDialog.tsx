"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface SalarySettlementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  monthYear: string;
  monthlySalary: string | number;
  calculatedPayable: number;
  previousMonthUpad: number;
  currentMonthExpenses: number;
  existingSlip?: any;
}

export function SalarySettlementDialog({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  monthYear,
  calculatedPayable,
  previousMonthUpad,
  currentMonthExpenses,
  existingSlip,
}: SalarySettlementDialogProps) {
  const queryClient = useQueryClient();
  const [decidedSalary, setDecidedSalary] = useState(
    existingSlip?.decidedSalary || String(calculatedPayable)
  );
  const [payoutAmount, setPayoutAmount] = useState(
    existingSlip?.payoutAmount || "0"
  );
  const [notes, setNotes] = useState(existingSlip?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const decidedNum = parseFloat(decidedSalary) || 0;
  const payoutNum = parseFloat(payoutAmount) || 0;

  // Total draws by employee = prev month unsettled upad + expenses already logged this month + payout given now
  const totalDrawn = previousMonthUpad + currentMonthExpenses + payoutNum;
  // If employee has drawn more than decided salary, excess is unsettled upad rolling forward!
  const unsettledUpad = Math.max(0, totalDrawn - decidedNum);
  // Net cash due to employee (if total drawn < decided salary)
  const remainingDue = Math.max(0, decidedNum - (previousMonthUpad + currentMonthExpenses));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (decidedSalary === "" || decidedNum < 0) {
      toast.error("Please enter a valid decided salary");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/api/salary-slips", {
        employeeId,
        monthYear,
        decidedSalary: String(decidedNum),
        payoutAmount: String(payoutNum),
        notes,
      });

      toast.success("Month-end salary settlement finalized!");
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to finalize settlement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Month-End Salary Settlement
              </DialogTitle>
              <p className="text-xs text-gray-500">
                {employeeName} — Period: {monthYear}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Summary Breakdown */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex justify-between items-center text-gray-700">
              <span>Attendance Calculated Wage:</span>
              <span className="font-semibold text-gray-900">
                ₹{calculatedPayable.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between items-center text-amber-700">
              <span>Previous Month Unsettled Upad:</span>
              <span className="font-semibold">
                + ₹{previousMonthUpad.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between items-center text-amber-700">
              <span>Current Month Expenses / Advances:</span>
              <span className="font-semibold">
                + ₹{currentMonthExpenses.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold text-gray-900">
              <span>Total Already Drawn / Due:</span>
              <span className="text-amber-800">
                ₹{(previousMonthUpad + currentMonthExpenses).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Decided Salary Input */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-gray-800">
              Admin Decided Salary for {monthYear} (₹) *
            </Label>
            <Input
              type="number"
              placeholder="e.g. 20000"
              value={decidedSalary}
              onChange={(e) => setDecidedSalary(e.target.value)}
              required
            />
            <p className="text-[11px] text-gray-500">
              You can adjust this for festival bonus, paid holidays, or deductions for excessive leaves.
            </p>
          </div>

          {/* Remaining Balance & Additional Payout */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex justify-between items-center text-blue-900 font-medium">
              <span>Remaining Balance to Pay:</span>
              <span className="text-sm font-bold text-blue-800">
                ₹{remainingDue.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="pt-2 space-y-1">
              <Label className="text-xs font-semibold text-blue-950">
                Additional Cash / Bank Payout Given Now (₹)
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="bg-white"
              />
              <p className="text-[10px] text-blue-600">
                Any payout entered here will automatically be logged as a Salary Expense for today.
              </p>
            </div>
          </div>

          {/* Rolling Upad Preview */}
          <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            unsettledUpad > 0
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              <div>
                <span className="font-semibold block">
                  {unsettledUpad > 0 ? "Upad Carried Forward to Next Month:" : "Status:"}
                </span>
                <span className="text-[11px] text-gray-600">
                  {unsettledUpad > 0
                    ? "Employee drew more than decided salary. Excess will roll over."
                    : "Salary is fully settled. No excess upad."}
                </span>
              </div>
            </div>
            <span className="text-sm font-bold">
              ₹{unsettledUpad.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Settlement Notes */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-gray-700">
              Settlement Notes (Optional)
            </Label>
            <Textarea
              placeholder="e.g. Approved 2 paid medical leaves, 5k advance carried forward..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
            >
              {isSubmitting ? "Finalizing..." : "Finalize & Save Settlement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

