"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  customerName: string;
  linkedInfo: {
    invoicesCount: number;
    paymentsCount: number;
  };
  isLoading: boolean;
}

export function DeleteCustomerDialog({
  isOpen,
  onClose,
  onConfirm,
  customerName,
  linkedInfo,
  isLoading,
}: DeleteCustomerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white p-6 rounded-lg shadow-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <AlertTriangle className="w-6 h-6" />
            <DialogTitle className="text-xl font-bold">Delete Customer</DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 text-sm">
            Are you sure you want to delete customer <strong className="text-gray-900">{customerName}</strong>?
          </DialogDescription>
        </DialogHeader>

        {linkedInfo.invoicesCount > 0 || linkedInfo.paymentsCount > 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2 my-4">
            <h4 className="font-semibold text-red-800 text-sm">Linked Data Found:</h4>
            <ul className="text-xs text-red-700 space-y-1 list-disc pl-4">
              <li><strong>{linkedInfo.invoicesCount}</strong> linked invoice(s)</li>
              <li><strong>{linkedInfo.paymentsCount}</strong> payment record(s)</li>
            </ul>
            <p className="text-xs font-semibold text-red-800 pt-1">
              Deleting this customer will permanently erase all associated invoices and payments.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 my-4">No linked invoices or payment records found for this customer.</p>
        )}

        <DialogFooter className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Yes, Delete Customer & Linked Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

