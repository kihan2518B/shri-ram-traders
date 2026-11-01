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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { Receipt } from "lucide-react";

interface QuickExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employees: { id: string; name: string }[];
  defaultEmployeeId?: string;
  defaultType?: string;
}

const EXPENSE_TYPES = [
  { label: "Salary / Advance (Upad)", value: "Salary" },
  { label: "Utilities", value: "Utilities" },
  { label: "Medical", value: "Medical" },
  { label: "Food & Refreshment", value: "Food" },
  { label: "Travel / Transport", value: "Travel" },
  { label: "Other", value: "Other" },
];

export function QuickExpenseDialog({
  isOpen,
  onClose,
  employees,
  defaultEmployeeId,
  defaultType = "Salary",
}: QuickExpenseDialogProps) {
  const queryClient = useQueryClient();
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId || "none");
  const [type, setType] = useState(defaultType);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync if defaultEmployeeId changes
  React.useEffect(() => {
    if (defaultEmployeeId) {
      setEmployeeId(defaultEmployeeId);
    }
  }, [defaultEmployeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/api/expenses", {
        type,
        amount: String(amount),
        description: description.trim(),
        expenseDate,
        employeeId: employeeId !== "none" ? employeeId : null,
      });

      toast.success("Expense logged successfully!");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["balance-sheet"] });

      setAmount("");
      setDescription("");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to log expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Log Expense / Advance
              </DialogTitle>
              <p className="text-xs text-gray-500">
                Record salary advance (Upad), medical, utilities, or general expenses
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          {/* Employee Selection */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-gray-700">
              Select Employee (Optional)
            </Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="General (No Employee)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">General / No Employee</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">
                Expense Type *
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">
                Amount (₹) *
              </Label>
              <Input
                type="number"
                placeholder="e.g. 2000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-gray-700">
              Description *
            </Label>
            <Input
              placeholder="e.g. Festival advance / Medical aid / Grocery bill"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-gray-700">
              Expense Date
            </Label>
            <Input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isSubmitting ? "Logging..." : "Log Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

