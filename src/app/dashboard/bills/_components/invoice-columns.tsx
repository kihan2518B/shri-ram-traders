// components/Sales/sales-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowUpDown,
  Calendar,
  Eye,
} from "lucide-react";
import { Prisma } from "../../../../../generated/prisma/client";

// Helper function for payment status badge variant (defined here for direct use)
const getPaymentStatusColorClass = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-500 text-white"; // Assuming white text on colored badge
    case "PENDING":
      return "bg-yellow-500 text-black"; // Yellow usually needs black text
    default:
      return "bg-gray-500 text-white";
  }
};

type InvoiceWithRelation = Prisma.InvoiceGetPayload<{
  include: {
    organization: true;
    customer: true;
    user: true;
  };
}>;

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const createInvoiceColumns = (): ColumnDef<InvoiceWithRelation>[] => {
  return [
    {
      accessorKey: "invoiceNumber", // Actual Sale ID (can be hidden)
      header: ({ column }) => (
        <div className="flex items-center justify-start">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()} // Use simple toggleSorting
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            Invoice ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-medium">#{row.original.invoiceNumber}</div>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      // NEW: Product Summary Column
      accessorKey: "createdAt", // Access the array directly
      header: ({ column }) => (
        <div className="flex items-center justify-start">
          <Button
            variant="ghost"
            // Sorting might be complex for an array, often disabled or custom sorting by main product name
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            Date
          </Button>
        </div>
      ),

      cell: ({ row }) => (
        <div className="text-neutral-text flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-neutral-text/70" />
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "customer.name",
      header: ({ column }) => (
        <div className="flex items-center justify-start">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()}
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            Customer Name
          </Button>
        </div>
      ),
      cell: ({ row }) => row.original.customer?.name || "N/A",
      enableSorting: false,
    },
    {
      accessorKey: "organization.name",
      header: ({ column }) => (
        <div className="flex items-center justify-start">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()}
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            Organization
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => row.original.organization?.name || "N/A",
      enableSorting: true,
    },
    {
      accessorKey: "vehicalNumber",
      header: ({ column }) => (
        <div className="flex items-center justify-start">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()}
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            Vehical
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => row.original.vehicalNumber || "N/A",
      enableSorting: false,
      enableHiding: true,
    },
    {
      // Corrected to use totalAmount directly from row.original
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()}
            className="h-8 data-[state=open]:bg-accent"
          >
            Total Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-bold text-green-700 text-right">
          ₹{(row.original.totalAmount || 0).toFixed(2)}
        </div>
      ),
      sortingFn: (rowA, rowB) => {
        const totalA = rowA.original.totalAmount || 0;
        const totalB = rowB.original.totalAmount || 0;
        return totalA - totalB;
      },
      enableSorting: true,
      filterFn: (row, id, filterValue) => {
        const totalAmount = row.original.totalAmount || 0;
        const filterNumber = parseFloat(String(filterValue));

        if (!isNaN(filterNumber)) {
          return totalAmount === filterNumber;
        } else {
          return String(totalAmount).includes(String(filterValue));
        }
      },
    },
    {
      accessorKey: "invoiceType",
      header: ({ column }) => (
        <div className="flex items-center justify-start">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()}
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
            row.original.invoiceType === "CREDIT"
              ? "bg-primary/10 text-primary"
              : "bg-[#15803D]/10 text-[#15803D]"
          }`}
        >
          {row.original.invoiceType === "CREDIT" ? (
            <ArrowUpCircle className="w-3.5 h-3.5" />
          ) : (
            <ArrowDownCircle className="w-3.5 h-3.5" />
          )}
          {row.original.invoiceType}
        </span>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div className="flex items-center justify-start">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()}
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            Payment Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <Badge
          className={`capitalize ${getPaymentStatusColorClass(
            row.original.status
          )}`}
        >
          {row.original.status.replace(/_/g, " ").toLowerCase()}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        return row.original.status === value;
      },
      enableSorting: true,
    },
  ];
};
