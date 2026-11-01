"use client";

import React, { useState, useEffect } from "react";
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
import { Edit2 } from "lucide-react";

interface EditEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: string;
    name: string;
    phone?: string | null;
    monthlySalary: string | number;
    joiningDate?: string | null;
    exitDate?: string | null;
    isWorking: boolean;
    notes?: string | null;
    organizationId?: string;
    organization?: { id: string; name: string };
  };
  organizations: { id: string; name: string }[];
}

export function EditEmployeeDialog({
  isOpen,
  onClose,
  employee,
  organizations,
}: EditEmployeeDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState(employee.name || "");
  const [phone, setPhone] = useState(employee.phone || "");
  const [orgId, setOrgId] = useState(
    employee.organizationId || employee.organization?.id || organizations[0]?.id || ""
  );
  const [monthlySalary, setMonthlySalary] = useState(
    String(employee.monthlySalary || "0")
  );
  const [joiningDate, setJoiningDate] = useState(
    employee.joiningDate ? new Date(employee.joiningDate).toISOString().split("T")[0] : ""
  );
  const [exitDate, setExitDate] = useState(
    employee.exitDate ? new Date(employee.exitDate).toISOString().split("T")[0] : ""
  );
  const [isWorking, setIsWorking] = useState(employee.isWorking !== false);
  const [notes, setNotes] = useState(employee.notes || "");

  useEffect(() => {
    setName(employee.name || "");
    setPhone(employee.phone || "");
    setOrgId(employee.organizationId || employee.organization?.id || organizations[0]?.id || "");
    setMonthlySalary(String(employee.monthlySalary || "0"));
    setJoiningDate(
      employee.joiningDate ? new Date(employee.joiningDate).toISOString().split("T")[0] : ""
    );
    setExitDate(
      employee.exitDate ? new Date(employee.exitDate).toISOString().split("T")[0] : ""
    );
    setIsWorking(employee.isWorking !== false);
    setNotes(employee.notes || "");
  }, [employee, organizations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter employee name");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.put(`/api/employees/${employee.id}`, {
        name,
        phone,
        monthlySalary,
        joiningDate: joiningDate || null,
        exitDate: !isWorking ? exitDate || null : null,
        isWorking,
        notes,
        organizationId: orgId,
      });

      toast.success("Employee details updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["employee", employee.id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Edit Employee Details
              </DialogTitle>
              <p className="text-xs text-gray-500">
                Update salary, contact, organization, or active status
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Organization */}
          {organizations.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">
                Organization *
              </Label>
              <Select value={orgId} onValueChange={setOrgId}>
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
          )}

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
                Mobile Number
              </Label>
              <Input
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Monthly Salary & Joining Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">
                Monthly Salary (₹) *
              </Label>
              <Input
                type="number"
                placeholder="e.g. 20000"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(e.target.value)}
                required
              />
            </div>
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
          </div>

          {/* Active Status Checkbox */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editIsWorking"
                checked={isWorking}
                onChange={(e) => setIsWorking(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="editIsWorking"
                className="text-xs font-semibold text-gray-800 cursor-pointer"
              >
                Currently Working Staff (Active)
              </label>
            </div>
            <p className="text-[11px] text-gray-500">
              Uncheck if this employee has left the company. Inactive employees won&apos;t be shown in default attendance marking.
            </p>

            {!isWorking && (
              <div className="space-y-1 pt-2 border-t border-gray-200">
                <Label className="text-xs font-semibold text-gray-700">
                  Exit / Relieving Date
                </Label>
                <Input
                  type="date"
                  value={exitDate}
                  onChange={(e) => setExitDate(e.target.value)}
                  className="bg-white"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-gray-700">
              Notes / Remarks
            </Label>
            <Textarea
              placeholder="e.g. Role, special terms, department..."
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isSubmitting ? "Updating..." : "Update Details"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

