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
import toast from "react-hot-toast";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, Users, Search, Check } from "lucide-react";

interface QuickAttendanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employees: { id: string; name: string; isWorking?: boolean }[];
}

const ATTENDANCE_OPTIONS = [
  { value: "FULL_DAY", label: "Full Day (100%)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { value: "THREE_QUARTER", label: "3/4 Day (75%)", color: "text-sky-700 bg-sky-50 border-sky-200" },
  { value: "HALF_DAY", label: "Half Day (50%)", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { value: "QUARTER_DAY", label: "1/4 Day (25%)", color: "text-orange-700 bg-orange-50 border-orange-200" },
  { value: "ABSENT", label: "Absent / Leave (0%)", color: "text-red-700 bg-red-50 border-red-200" },
];

export function QuickAttendanceDialog({
  isOpen,
  onClose,
  employees,
}: QuickAttendanceDialogProps) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("FULL_DAY");
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active employees
  const activeEmployees = employees.filter((e) => e.isWorking !== false);
  const filteredEmployees = activeEmployees.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedEmpIds.length === filteredEmployees.length) {
      setSelectedEmpIds([]);
    } else {
      setSelectedEmpIds(filteredEmployees.map((e) => e.id));
    }
  };

  const toggleEmployee = (id: string) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpIds.length) {
      toast.error("Please select at least one employee");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/attendance/bulk", {
        date,
        status,
        employeeIds: selectedEmpIds,
        note,
      });

      toast.success(res.data.message || "Attendance recorded successfully!");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee"] });
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      setSelectedEmpIds([]);
      setNote("");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to mark attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Quick Bulk Attendance
              </DialogTitle>
              <p className="text-xs text-gray-500">
                Mark attendance for multiple employees in one click
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Date Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">Optional Note</Label>
              <Input
                placeholder="e.g. Regular shift / Overtime"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* Attendance Type Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">
              Select Attendance Type *
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ATTENDANCE_OPTIONS.map((opt) => {
                const isSelected = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`py-2 px-2.5 text-xs font-semibold rounded-lg border text-center transition-all ${
                      isSelected
                        ? `${opt.color} ring-2 ring-blue-500 shadow-sm font-bold`
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Employee Selection List */}
          <div className="space-y-2 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-500" />
                Select Employees ({selectedEmpIds.length} of {activeEmployees.length})
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs text-blue-600 h-7 px-2 hover:bg-blue-50"
              >
                {selectedEmpIds.length === filteredEmployees.length && filteredEmployees.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <Input
                placeholder="Search active employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-gray-50"
              />
            </div>

            {/* Scrollable list */}
            <div className="border border-gray-200 rounded-lg p-2 max-h-48 overflow-y-auto space-y-1 bg-white">
              {filteredEmployees.length === 0 ? (
                <p className="text-xs text-center text-gray-400 py-4">
                  No active employees found
                </p>
              ) : (
                filteredEmployees.map((emp) => {
                  const isChecked = selectedEmpIds.includes(emp.id);
                  return (
                    <div
                      key={emp.id}
                      onClick={() => toggleEmployee(emp.id)}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors text-xs select-none ${
                        isChecked
                          ? "bg-blue-50/70 border border-blue-200 text-blue-900 font-medium"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span>{emp.name}</span>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                          isChecked
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
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
              disabled={isSubmitting || selectedEmpIds.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              {isSubmitting
                ? "Recording..."
                : `Mark Attendance (${selectedEmpIds.length})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

