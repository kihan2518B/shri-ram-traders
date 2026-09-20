"use client";

import React, { useState } from "react";
import { ColumnFiltersState } from "@tanstack/react-table";

import { DataTable } from "./Data-Table";
import { createInvoiceColumns } from "./invoice-columns";
import { useCustomers, useOrganizations } from "@/hooks/useInvoiceFilters";
import { Customer, Organization } from "../../../../../generated/prisma";
import { useInvoices } from "@/hooks/invoice";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Plus } from "lucide-react";

type FiltersState = {
  customer: string;
  organization: string;
  status: string;
};

export default function InvoicesComponent({ user }: { user: any }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [filters, setFilters] = useState<FiltersState>({
    customer: "",
    organization: "",
    status: "",
  });
  const {
    data: customers,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
  } = useCustomers();
  const {
    data: organizations,
    isLoading: isOrganizationLoading,
    isError: isOrganizationError,
  } = useOrganizations();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInvoices(user);

  const allInvoices = data?.pages.flatMap((p) => p.invoices) ?? [];

  const filteredInvoices = allInvoices.filter((invoice: any) => {
    if (filters.customer) {
      if (
        invoice.customer?.name !== filters.customer &&
        invoice.billerName !== filters.customer
      ) {
        return false;
      }
    }

    if (filters.organization) {
      if (invoice.organization?.name !== filters.organization) {
        return false;
      }
    }

    if (filters.status) {
      if (invoice.status !== filters.status) {
        return false;
      }
    }

    return true;
  });

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Error loading invoices.
      </div>
    );
  }

  const customerList: Customer[] = Array.isArray(customers)
    ? customers
    : customers?.customers || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Invoices
          </h1>
          <p className="text-sm text-gray-500">
            Manage and view all credit and debit billing invoices
          </p>
        </div>
        <Link href="/dashboard/bills/new">
          <Button className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Invoice
          </Button>
        </Link>
      </div>

      <Filters
        filters={filters}
        setFilters={setFilters}
        isCustomerLoading={isCustomerLoading}
        isOrganizationLoading={isOrganizationLoading}
        isCustomerError={isCustomerError}
        isOrganizationError={isOrganizationError}
        customerList={customerList}
        organizationOptions={organizations as { organizations: Organization[] }}
      />

      <DataTable
        columns={createInvoiceColumns()}
        isLoading={isLoading}
        data={filteredInvoices}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
}

interface FiltersProps {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  customerList: Customer[];
  organizationOptions: { organizations: Organization[] };
  isCustomerLoading: boolean;
  isOrganizationLoading: boolean;
  isCustomerError?: boolean;
  isOrganizationError?: boolean;
}

function Filters({
  filters,
  setFilters,
  customerList,
  organizationOptions,
  isCustomerLoading,
  isOrganizationLoading,
  isCustomerError,
  isOrganizationError,
}: FiltersProps) {
  const hasActiveFilters = Object.values(filters).some(Boolean);

  const clearFilter = (key: keyof FiltersState) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
  };

  const clearAll = () => {
    setFilters({ customer: "", organization: "", status: "" });
  };

  return (
    <div className="bg-white shadow-sm rounded-xl p-4 border border-gray-200 space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-700" />
          <h3 className="text-sm font-semibold text-gray-800">
            Filter Invoices
          </h3>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Customer */}
        <Select
          value={filters.customer}
          disabled={isCustomerLoading || isCustomerError}
          onValueChange={(v) => setFilters((p) => ({ ...p, customer: v }))}
        >
          <SelectTrigger className="w-full bg-white text-sm">
            <SelectValue
              placeholder={
                isCustomerLoading
                  ? "Loading customers..."
                  : isCustomerError
                    ? "Failed to load customers"
                    : "Filter by Customer"
              }
            />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {!isCustomerLoading &&
              !isCustomerError &&
              customerList?.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Organization */}
        <Select
          value={filters.organization}
          disabled={isOrganizationLoading || isOrganizationError}
          onValueChange={(v) => setFilters((p) => ({ ...p, organization: v }))}
        >
          <SelectTrigger className="w-full bg-white text-sm">
            <SelectValue
              placeholder={
                isOrganizationLoading
                  ? "Loading organizations..."
                  : isOrganizationError
                    ? "Failed to load organizations"
                    : "Filter by Organization"
              }
            />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {!isOrganizationLoading &&
              !isOrganizationError &&
              organizationOptions?.organizations?.map((o) => (
                <SelectItem key={o.id} value={o.name}>
                  {o.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={filters.status}
          onValueChange={(v) => setFilters((p) => ({ ...p, status: v }))}
        >
          <SelectTrigger className="w-full bg-white text-sm">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-1">
          {Object.entries(filters).map(
            ([key, value]) =>
              value && (
                <Badge
                  key={key}
                  variant="outline"
                  className="flex items-center gap-1 bg-gray-50 text-xs text-gray-700"
                >
                  <span className="capitalize">{key}</span>: {value}
                  <button
                    onClick={() => clearFilter(key as keyof FiltersState)}
                  >
                    <X className="h-3 w-3 text-gray-500 hover:text-gray-900" />
                  </button>
                </Badge>
              ),
          )}
        </div>
      )}
    </div>
  );
}
