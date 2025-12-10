"use client";

import Link from "next/link";
import React, { useEffect, useMemo } from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Truck,
  Filter,
  X,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";
// Import shadcn components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Assume shadcn table
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";

interface InvoicesListProps {
  rawInvoices: any[];
  refetch: () => void;
  isLoading: boolean;
  invoices: any[];
  setInvoices: React.Dispatch<React.SetStateAction<any[]>>;
  filteredInvoices: any[];
  setFilteredInvoices: React.Dispatch<React.SetStateAction<any[]>>;
  organizationOptions: string[];
  setOrganizationOptions: React.Dispatch<React.SetStateAction<string[]>>;
  filters: {
    organization: string;
    invoiceType: string;
    status: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      organization: string;
      invoiceType: string;
      status: string;
    }>
  >;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage?: number;
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  totalpages: number;
  isFetchingNextPage?: boolean;
}

const columnHelper = createColumnHelper<any>();

export default function InvoicesList({
  rawInvoices,
  refetch,
  isLoading,
  invoices,
  setInvoices,
  filteredInvoices,
  setFilteredInvoices,
  organizationOptions,
  setOrganizationOptions,
  filters,
  setFilters,
  currentPage,
  totalpages,
  setCurrentPage,
  itemsPerPage = 10,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: InvoicesListProps) {
  // Initialize data and extract organization options
  useEffect(() => {
    if (rawInvoices) {
      const sortedInvoices = [...rawInvoices].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setInvoices(sortedInvoices);
      setFilteredInvoices(sortedInvoices);

      // Extract unique organization names for filter dropdown
      const uniqueOrgs = Array.from(
        new Set(sortedInvoices.map((invoice) => invoice.organization.name))
      );
      setOrganizationOptions(uniqueOrgs);
    }
  }, [rawInvoices, setInvoices, setFilteredInvoices, setOrganizationOptions]);

  // Apply filters
  useEffect(() => {
    if (invoices.length) {
      let result = [...invoices];

      if (filters.organization && filters.organization !== "all") {
        result = result.filter(
          (invoice) => invoice.organization.name === filters.organization
        );
      }

      if (filters.invoiceType && filters.invoiceType !== "all") {
        result = result.filter(
          (invoice) => invoice.invoiceType === filters.invoiceType
        );
      }

      if (filters.status && filters.status !== "all") {
        result = result.filter((invoice) => invoice.status === filters.status);
      }

      setFilteredInvoices(result);
      setCurrentPage(1); // Reset to first page when filters change
    }
  }, [filters, invoices, setFilteredInvoices, setCurrentPage]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(
    (filter) => filter !== ""
  );

  // React Table columns
  const columns = useMemo(
    () => [
      columnHelper.accessor("invoiceNumber", {
        header: "Invoice #",
        cell: (info) => (
          <Link
            href={`/dashboard/bills/${info.row.original.id}`}
            className="font-medium text-navy-900"
          >
            #{info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Date",
        cell: (info) => (
          <Link
            href={`/dashboard/bills/${info.row.original.id}`}
            className="text-neutral-text flex items-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5 text-neutral-text/70" />
            {formatDate(info.getValue())}
          </Link>
        ),
      }),
      columnHelper.accessor("customer", {
        header: "Customer",
        cell: (info) => (
          <Link
            href={`/dashboard/bills/${info.row.original.id}`}
            className="text-neutral-text"
          >
            {info.getValue()?.name || info.row.original.billerName || "N/A"}
          </Link>
        ),
      }),
      columnHelper.accessor("organization", {
        header: "Organization",
        cell: (info) => (
          <Link
            href={`/dashboard/bills/${info.row.original.id}`}
            className="text-neutral-text"
          >
            {info.getValue().name}
          </Link>
        ),
      }),
      columnHelper.accessor("vehicalNumber", {
        header: "Vehicle",
        cell: (info) => (
          <Link
            href={`/dashboard/bills/${info.row.original.id}`}
            className="text-neutral-text flex items-center gap-1"
          >
            <Truck className="w-3.5 h-3.5 text-neutral-text/70" />
            {info.getValue() || "N/A"}
          </Link>
        ),
      }),
      columnHelper.accessor("invoiceType", {
        header: "Type",
        cell: (info) => {
          const value = info.getValue();
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
                value === "CREDIT"
                  ? "bg-primary/10 text-primary"
                  : "bg-[#15803D]/10 text-[#15803D]"
              }`}
            >
              {value === "CREDIT" ? (
                <ArrowUpCircle className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownCircle className="w-3.5 h-3.5" />
              )}
              {value}
            </span>
          );
        },
      }),
      columnHelper.accessor("grandTotal", {
        header: "Amount",
        cell: (info) => {
          const row = info.row.original;
          const value = row.grandTotal || row.totalAmount;
          const type = row.invoiceType;
          return (
            <span
              className={type === "CREDIT" ? "text-primary" : "text-[#15803D]"}
            >
              ₹{value?.toFixed(2)}
            </span>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Link href={`/dashboard/bills/${info.row.original.id}`}>
            <span
              className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                info.getValue() === "COMPLETED"
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {info.getValue()}
            </span>
          </Link>
        ),
      }),
    ],
    []
  );

  console.log("filteredInvoices: ", totalpages);
  // React Table instance
  const table = useReactTable({
    data: filteredInvoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Number(totalpages),
  });

  // Reset a specific filter
  const clearFilter = (filterName: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: "",
    }));
  };

  // Reset all filters
  const clearAllFilters = () => {
    setFilters({
      organization: "",
      invoiceType: "",
      status: "",
    });
  };

  return (
    <div className="mt-8 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-navy-800 mb-4 sm:mb-0">
          Invoices
        </h2>

        {/* Filter badges for mobile - show when filters are active */}
        <div className="sm:hidden flex flex-wrap gap-2 mb-4">
          {filters.organization && (
            <Badge
              variant="outline"
              className="bg-neutral-light flex items-center gap-1"
            >
              Org: {filters.organization}
              <button
                onClick={() => clearFilter("organization")}
                className="ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.invoiceType && (
            <Badge
              variant="outline"
              className="bg-neutral-light flex items-center gap-1"
            >
              Type: {filters.invoiceType}
              <button
                onClick={() => clearFilter("invoiceType")}
                className="ml-1"
              >
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

      {/* Filter panel */}
      <div className="bg-neutral-white shadow rounded-lg mb-6 p-4 border border-neutral-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-navy-800" />
            <h3 className="text-sm font-medium text-navy-800">
              Filter Invoices
            </h3>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="text-navy-800 hover:bg-neutral-light"
              title="Refresh invoices"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              value={filters.invoiceType}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, invoiceType: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Invoice Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="CREDIT">Credit</SelectItem>
                <SelectItem value="DEBIT">Debit</SelectItem>
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
          {filters.organization && (
            <Badge
              variant="outline"
              className="bg-neutral-light flex items-center gap-1"
            >
              Organization: {filters.organization}
              <button
                onClick={() => clearFilter("organization")}
                className="ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.invoiceType && (
            <Badge
              variant="outline"
              className="bg-neutral-light flex items-center gap-1"
            >
              Type: {filters.invoiceType}
              <button
                onClick={() => clearFilter("invoiceType")}
                className="ml-1"
              >
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

      {/* Desktop: React Table with Pagination */}
      <div className="hidden sm:block bg-neutral-white shadow rounded-lg overflow-hidden border border-neutral-border">
        <div className="flex justify-between items-center bg-neutral-light px-4 py-3">
          <h3 className="text-sm font-medium text-navy-900">Invoice List</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-navy-800 hover:bg-neutral-light"
            title="Refresh invoices"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-4 py-3 text-left text-navy-900 text-sm font-medium"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={`border-t border-neutral-border hover:bg-neutral-light/50 ${
                      row.original.invoiceType === "CREDIT"
                        ? "bg-blue-50/50"
                        : "bg-[#15803D]/10"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="px-4 py-8 text-center text-neutral-text"
                  >
                    {hasActiveFilters
                      ? "No invoices match your filters. Try adjusting your criteria."
                      : "No invoices found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Table Pagination */}
        <div className="flex items-center justify-between border-t border-neutral-border bg-neutral-white px-4 py-3 sm:px-6">
          <div className="text-sm text-neutral-text">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of{" "}
            {filteredInvoices.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-sm text-neutral-text">Page</span>
              <Input
                type="number"
                className="w-16 h-8"
                min={1}
                max={table.getPageCount()}
                value={currentPage}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) : 1;
                  setCurrentPage(
                    Math.max(1, Math.min(page, table.getPageCount()))
                  );
                }}
              />
              <span className="text-sm text-neutral-text">
                of {table.getPageCount()}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalpages))
              }
              disabled={currentPage === totalpages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile: Card View with Load More */}
      <div className="sm:hidden space-y-4">
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {filteredInvoices
          .slice(0, currentPage * itemsPerPage)
          .map((invoice: any) => (
            <div
              key={invoice.id}
              className={`rounded-lg p-4 border shadow ${
                invoice.invoiceType === "CREDIT"
                  ? "bg-blue-50/30 border-blue-200"
                  : "bg-red-50/30 border-red-200"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-navy-800">
                    #{invoice.invoiceNumber}
                  </span>
                  <span className="text-xs text-neutral-text">
                    {formatDate(invoice.createdAt)}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    invoice.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {invoice.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <span className="text-xs text-neutral-text">Customer</span>
                  <p className="font-medium">
                    {invoice.customer?.name || invoice.billerName || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-neutral-text">
                    Organization
                  </span>
                  <p className="font-medium">{invoice.organization.name}</p>
                </div>
                <div>
                  <span className="text-xs text-neutral-text">Vehicle</span>
                  <p className="font-medium">{invoice.vehicalNumber}</p>
                </div>
                <div>
                  <span className="text-xs text-neutral-text">GST Amount</span>
                  <p className="font-medium">
                    ₹{invoice.gstAmount?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-neutral-border pt-3">
                <div className="flex items-center gap-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                      invoice.invoiceType === "CREDIT"
                        ? "bg-primary/10 text-primary"
                        : "bg-[#15803D]/10 text-[#15803D]"
                    }`}
                  >
                    {invoice.invoiceType === "CREDIT" ? (
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownCircle className="w-3.5 h-3.5" />
                    )}
                    {invoice.invoiceType}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-neutral-text">
                    Total Amount
                  </span>
                  <p
                    className={`font-semibold ${
                      invoice.invoiceType === "CREDIT"
                        ? "text-primary"
                        : "text-[#15803D]"
                    }`}
                  >
                    ₹
                    {invoice.grandTotal?.toFixed(2) ||
                      invoice.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <Link
                href={`/dashboard/bills/${invoice.id}`}
                className="mt-3 w-full block text-center text-sm font-medium text-primary hover:text-primary-hover py-2 border border-primary/20 rounded-md"
              >
                View Details
              </Link>
            </div>
          ))}
        {!isLoading && (!filteredInvoices || filteredInvoices.length === 0) && (
          <div className="text-center py-8 text-neutral-text">
            {hasActiveFilters
              ? "No invoices match your filters. Try adjusting your criteria."
              : "No invoices found."}
          </div>
        )}
        {/* Load More Button for Mobile */}
        {hasNextPage && !isFetchingNextPage && (
          <div className="text-center">
            <Button
              onClick={() => fetchNextPage()}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Load More
            </Button>
          </div>
        )}
        {isFetchingNextPage && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}
