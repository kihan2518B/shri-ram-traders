"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import InvoiceForm from "./InvoiceForm";
import React, { useState } from "react";
import { DataTable } from "./Data-Table";
import { createInvoiceColumns } from "./invoice-columns";
import { ColumnFiltersState } from "@tanstack/react-table";
import { useInvoiceFilters } from "@/hooks/useInvoiceFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const fetchInvoices = async ({ pageParam = 1 }: { pageParam?: number }) => {
  const res = await axios.get("/api/invoices", {
    params: { page: pageParam, limit: 10 },
  });
  console.log("res.data: ", res.data);

  return res.data;
};

export default function InvoicesComponent({ user }: { user: any }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    });

  const allInvoices = data?.pages.flatMap((page) => page.invoices) || [];
  const totalPages = data?.pages[0]?.totalPages || 1;

  // Use hook for filters
  const { filters, setFilters, customerOptions, organizationOptions } =
    useInvoiceFilters(allInvoices);

  // Client-side filtering
  const filteredInvoices = allInvoices.filter((invoice) => {
    let matches = true;
    if (filters.customer && filters.customer !== "all") {
      matches =
        matches &&
        (invoice.customer?.name === filters.customer ||
          invoice.billerName === filters.customer);
    }
    if (filters.organization && filters.organization !== "all") {
      matches = matches && invoice.organization.name === filters.organization;
    }
    if (filters.status && filters.status !== "all") {
      matches = matches && invoice.status === filters.status;
    }
    return matches;
  });

  if (isError) {
    return <div>Error loading invoices. Please try refreshing.</div>;
  }
  const columns = createInvoiceColumns();

  return (
    <div className="p-6 w-screen">
      <h1 className="text-3xl font-bold mb-6">Invoices</h1>
      <Filters
        filters={filters}
        setFilters={setFilters}
        customerOptions={customerOptions}
        organizationOptions={organizationOptions}
      />
      <DataTable
        columns={columns}
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
      <InvoiceForm user={user} refetch={refetch} />
    </div>
  );
}


interface FiltersProps {
  filters: {
    customer: string;
    organization: string;
    status: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  customerOptions: string[];
  organizationOptions: string[];
}

 function Filters({
  filters,
  setFilters,
  customerOptions,
  organizationOptions,
}: FiltersProps) {
  const hasActiveFilters = Object.values(filters).some((filter) => filter !== '');

  const clearFilter = (filterName: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: '',
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      customer: '',
      organization: '',
      status: '',
    });
  };

  return (
    <div className="bg-neutral-white shadow rounded-lg mb-6 p-4 border border-neutral-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-navy-800" />
          <h3 className="text-sm font-medium text-navy-800">Filter Invoices</h3>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs text-neutral-text hover:text-accent-red"
            >
              Clear All
            </Button>
          )}
          {/* Refresh can be added here if needed */}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Select
            value={filters.customer}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, customer: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customerOptions.map((cust) => (
                <SelectItem key={cust} value={cust}>
                  {cust}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            value={filters.organization}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, organization: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizations</SelectItem>
              {organizationOptions.map((org) => (
                <SelectItem key={org} value={org}>
                  {org}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters - desktop view */}
      <div className="hidden sm:flex flex-wrap gap-2 mt-4">
        {filters.customer && (
          <Badge
            variant="outline"
            className="bg-neutral-light flex items-center gap-1"
          >
            Customer: {filters.customer}
            <button onClick={() => clearFilter("customer")} className="ml-1">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {filters.organization && (
          <Badge
            variant="outline"
            className="bg-neutral-light flex items-center gap-1"
          >
            Organization: {filters.organization}
            <button onClick={() => clearFilter("organization")} className="ml-1">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {filters.status && (
          <Badge
            variant="outline"
            className="bg-neutral-light flex items-center gap-1"
          >
            Status: {filters.status}
            <button onClick={() => clearFilter("status")} className="ml-1">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>
    </div>
  );
}
