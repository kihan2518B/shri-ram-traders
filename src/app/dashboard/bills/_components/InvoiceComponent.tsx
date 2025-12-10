"use client";

import { User } from "@supabase/supabase-js";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import InvoicesList from "./InvoicesList";
import InvoiceForm from "./InvoiceForm";
import React, { useState } from "react";
import { DataTable } from "./Data-Table";
import { createInvoiceColumns } from "./invoice-columns";
import { ColumnFiltersState } from "@tanstack/react-table";

const fetchInvoices = async ({ pageParam = 1 }: { pageParam?: number }) => {
  const res = await axios.get("/api/invoices", {
    params: { page: pageParam, limit: 10 },
  });
  console.log("res.data: ", res.data);

  return res.data;
};

export default function InvoicesComponent({ user }: { user: any }) {
  const [filters, setFilters] = useState({
    organization: "",
    invoiceType: "",
    status: "",
  });
  // const [currentPage, setCurrentPage] = useState(1);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const {
    data,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["invoices", filters], // Invalidate on filter change
    queryFn: fetchInvoices,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Flatten all pages into single array
  const allInvoices = data?.pages.flatMap((page) => page.invoices) || [];
  const totalpages = data?.pages[0]?.totalPages || 1;
  // Client-side filtering (apply to loaded data)
  const filteredInvoices = allInvoices.filter((invoice) => {
    if (filters.organization && filters.organization !== "all") {
      return invoice.organization.name === filters.organization;
    }
    if (filters.invoiceType && filters.invoiceType !== "all") {
      return invoice.invoiceType === filters.invoiceType;
    }
    if (filters.status && filters.status !== "all") {
      return invoice.status === filters.status;
    }
    return true;
  });

  // Extract organizations from loaded invoices
  const organizationOptions = Array.from(
    new Set(allInvoices.map((invoice) => invoice.organization.name))
  );
  const columns = createInvoiceColumns();
  return (
    <div className="p-6 w-screen">
      <h1 className="text-3xl font-bold mb-6">Invoices</h1>
      <DataTable
        columns={columns}
        isLoading={isLoading}
        data={allInvoices}
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
