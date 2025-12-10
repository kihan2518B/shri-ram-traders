"use client";

import { User } from "@supabase/supabase-js";
import Link from "next/link";
import React, { useEffect } from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Truck,
  Filter,
  X,
  RefreshCw,
} from "lucide-react";

// Import shadcn components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InvoicesListProps {
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
  itemsPerPage?: number; // Optional, default to 5
  rawInvoices: any[];
  refetch: () => void;
  isLoading: boolean
}

export default function InvoicesList({
  invoices,
  setInvoices,
  filteredInvoices,
  setFilteredInvoices,
  organizationOptions,
  setOrganizationOptions,
  filters,
  setFilters,
  currentPage,
  setCurrentPage,
  itemsPerPage = 5,
  rawInvoices,
  refetch,
  isLoading
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

  // Pagination calculation
  const totalPages = filteredInvoices
    ? Math.ceil(filteredInvoices.length / itemsPerPage)
    : 0;
  const currentInvoices = filteredInvoices
    ? filteredInvoices.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
    : [];

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

      {/* Desktop: Table View */}
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
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-light">
              <th className="px-4 py-3 text-left text-navy-900 text-sm font-medium">
                Invoice #
              </th>
              <th className="px-4 py-3 text-left text-navy-900 text-sm font-medium">
                Date
              </th>
              <th className="px-4 py-3 text-left text-navy-900 text-sm font-medium">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-navy-900 text-sm font-medium">
                Organization
              </th>
              <th className="px-4 py-3 text-left text-navy-900 text-sm font-medium">
                Vehicle
              </th>
              <th className="px-4 py-3 text-left text-navy-900 text-sm font-medium">
                Type
              </th>
              <th className="px-4 py-3 text-left text-navy-900 text-sm font-medium">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-navy-900 text-sm font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-4 text-center text-neutral-text"
                >
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </td>
              </tr>
            )}
            {currentInvoices?.map((invoice: any) => (
              <tr
                key={invoice.id}
                className={`border-t border-neutral-border hover:bg-neutral-light/50 ${invoice.invoiceType === "CREDIT"
                  ? "bg-blue-50/50"
                  : "bg-[#15803D]/10"
                  }`}
              >
                <td className="px-4 py-3 font-medium text-navy-900">
                  <Link href={`/dashboard/bills/${invoice.id}`}>
                    #{invoice.invoiceNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-text flex items-center gap-1">
                  <Link href={`/dashboard/bills/${invoice.id}`}>
                    <Calendar className="w-3.5 h-3.5 text-neutral-text/70" />
                    {formatDate(invoice.createdAt)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-text">
                  <Link href={`/dashboard/bills/${invoice.id}`}>
                    {invoice.customer?.name || invoice.billerName || "N/A"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-text">
                  <Link href={`/dashboard/bills/${invoice.id}`}>
                    {invoice.organization.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-text flex items-center gap-1">
                  <Link href={`/dashboard/bills/${invoice.id}`}>
                    <Truck className="w-3.5 h-3.5 text-neutral-text/70" />
                    {invoice.vehicalNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${invoice.invoiceType === "CREDIT"
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
                </td>
                <td className="px-4 py-3 font-medium">
                  <span
                    className={
                      invoice.invoiceType === "CREDIT"
                        ? "text-primary"
                        : "text-[#15803D]"
                    }
                  >
                    ₹
                    {invoice.grandTotal?.toFixed(2) ||
                      invoice.totalAmount.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/bills/${invoice.id}`}>
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${invoice.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                        }`}
                    >
                      {invoice.status}
                    </span>
                  </Link>
                </td>
              </tr>
            ))}
            {!isLoading &&
              (!filteredInvoices || filteredInvoices.length === 0) && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-neutral-text"
                  >
                    {hasActiveFilters
                      ? "No invoices match your filters. Try adjusting your criteria."
                      : "No invoices found."}
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card View */}
      <div className="sm:hidden space-y-4">
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {currentInvoices?.map((invoice: any) => (
          <div
            key={invoice.id}
            className={`rounded-lg p-4 border shadow ${invoice.invoiceType === "CREDIT"
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
                className={`px-2 py-1 text-xs font-medium rounded-full ${invoice.status === "COMPLETED"
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
                <span className="text-xs text-neutral-text">Organization</span>
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
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${invoice.invoiceType === "CREDIT"
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
                <span className="text-xs text-neutral-text">Total Amount</span>
                <p
                  className={`font-semibold ${invoice.invoiceType === "CREDIT"
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
      </div>

      {/* shadcn Pagination */}
      {totalPages > 0 && (
        <div className="mt-6">
          <div className="text-sm text-neutral-text text-center mb-2">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of{" "}
            {filteredInvoices.length} entries
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {/* First page */}
              {currentPage > 3 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(1);
                    }}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Ellipsis if needed */}
              {currentPage > 4 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Page numbers */}
              {Array.from({ length: totalPages })
                .map((_, i) => i + 1)
                .filter((pageNum) => {
                  if (totalPages <= 5) return true;
                  return (
                    pageNum >= Math.max(currentPage - 1, 1) &&
                    pageNum <= Math.min(currentPage + 1, totalPages)
                  );
                })
                .map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNum);
                      }}
                      isActive={pageNum === currentPage}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {/* Ellipsis if needed */}
              {currentPage < totalPages - 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Last page */}
              {currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(totalPages);
                    }}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}