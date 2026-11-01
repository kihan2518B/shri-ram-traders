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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { UserCheck, UserMinus } from "lucide-react";

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organizations: { id: string; name: string }[];
  defaultOrgId?: string;
}

export function AddEmployeeDialog({
  isOpen,
  onClose,
  organizations,
  defaultOrgId,
}: AddEmployeeDialogProps) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"CURRENT" | "OLD">("CURRENT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orgId, setOrgId] = useState(defaultOrgId || "");
  const [notes, setNotes] = useState("");

  // Current employee fields
  const [monthlySalary, setMonthlySalary] = useState("");
  const [joiningDate, setJoiningDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [initialSalaryPaid, setInitialSalaryPaid] = useState("");

  // Old employee fields
  const [fromDate, setFromDate] = useState("");
  const [exitDate, setExitDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [totalPastSalary, setTotalPastSalary] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  const resetForm = () => {
    setName("");
    setPhone("");
    setNotes("");
    setMonthlySalary("");
    setInitialSalaryPaid("");
    setFromDate("");
    setTotalPastSalary("");
    setIsWorking(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter employee name");
      return;
    }
    const finalOrgId = orgId || organizations[0]?.id;
    if (!finalOrgId) {
      toast.error("Please select an organization");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "CURRENT") {
        await axios.post("/api/employees", {
          name,
          phone,
          organizationId: finalOrgId,
          monthlySalary: monthlySalary || "0",
          joiningDate,
          initialSalaryPaid,
          isWorking: true,
          notes,
        });
        toast.success(`Active employee ${name} added successfully!`);
      } else {
        await axios.post("/api/employees", {
          name,
          phone,
          organizationId: finalOrgId,
          monthlySalary: monthlySalary || "0",
          joiningDate: fromDate || null,
          exitDate,
          totalPastSalary,
          isWorking,
          notes,
        });
        toast.success(`Past employee record for ${name} added!`);
      }

      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      resetForm();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to create employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Add New Employee
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Add a current working employee or record a past employee with historical payout.
          </p>
        </DialogHeader>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setMode("CURRENT");
              setIsWorking(true);
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-md transition-all ${
              mode === "CURRENT"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Current Employee</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("OLD");
              setIsWorking(false);
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-md transition-all ${
              mode === "OLD"
                ? "bg-white text-amber-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <UserMinus className="w-4 h-4" />
            <span>Past / Old Employee</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Organization */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-gray-700">
              Organization *
            </Label>
            <Select
              value={orgId || (organizations[0]?.id || "")}
              onValueChange={setOrgId}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select Organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">
                Employee Name *
              </Label>
              <Input
                placeholder="e.g. Ramesh Bhai"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">
                Mobile Number (Optional)
              </Label>
              <Input
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Current Employee specific fields */}
          {mode === "CURRENT" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-700">
                    Joining Date
                  </Label>
                  <Input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-700">
                    Monthly Salary (₹) *
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g. 18000"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <Label className="text-xs font-semibold text-blue-900">
                  Salary Paid Till Now (Optional)
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 5000"
                  value={initialSalaryPaid}
                  onChange={(e) => setInitialSalaryPaid(e.target.value)}
                  className="bg-white"
                />
                <p className="text-[11px] text-blue-600 mt-1">
                  If filled, automatically creates an expense entry of this amount
                  with description &quot;Initial Salary Paid till {joiningDate}&quot;.
                  This field is not saved on the employee record.
                </p>
              </div>
            </>
          )}

          {/* Old Employee specific fields */}
          {mode === "OLD" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-700">
                    Working Period: From
                  </Label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-700">
                    Working Period: To
                  </Label>
                  <Input
                    type="date"
                    value={exitDate}
                    onChange={(e) => setExitDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                <Label className="text-xs font-semibold text-amber-900">
                  Total Salary Given Till Now (₹) *
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 45000"
                  value={totalPastSalary}
                  onChange={(e) => setTotalPastSalary(e.target.value)}
                  className="bg-white"
                  required
                />
                <p className="text-[11px] text-amber-700 mt-1">
                  Will create an expense record with description &quot;Salary Given
                  till {exitDate || "date"}&quot;.
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="isWorkingCheck"
                  checked={isWorking}
                  onCheckedChange={(checked) => setIsWorking(Boolean(checked))}
                />
                <label
                  htmlFor="isWorkingCheck"
                  className="text-xs font-medium text-gray-700 cursor-pointer"
                >
                  Is this employee currently working? (Check to calculate future salaries)
                </label>
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-gray-700">
              Notes (Optional)
            </Label>
            <Textarea
              placeholder="e.g. Carpenter, shift timing, special remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
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
              {isSubmitting ? "Saving..." : "Save Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

