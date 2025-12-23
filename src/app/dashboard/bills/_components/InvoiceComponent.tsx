// "use client";

// import { useInfiniteQuery } from "@tanstack/react-query";
// import axios from "axios";
// import InvoiceForm from "./InvoiceForm";
// import React, { useState } from "react";
// import { DataTable } from "./Data-Table";
// import { createInvoiceColumns } from "./invoice-columns";
// import { ColumnFiltersState } from "@tanstack/react-table";
// import { useCustomers,useOrganizations } from "@/hooks/useInvoiceFilters";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Button } from '@/components/ui/button';
// import { Filter, X } from 'lucide-react';
// import { Badge } from '@/components/ui/badge';

// const fetchInvoices = async ({ pageParam = 1 }: { pageParam?: number }) => {
//   const res = await axios.get("/api/invoices", {
//     params: { page: pageParam, limit: 10 },
//   });
//   console.log("res.data: ", res.data);

//   return res.data;
// };

// export default function InvoicesComponent({ user }: { user: any }) {
//   const [globalFilter, setGlobalFilter] = useState("");
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

//   const {
//     data,
//     isLoading,
//     isError,
//     refetch,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//   } = useInfiniteQuery({
//     queryKey: ["invoices"],
//     queryFn: fetchInvoices,
//     initialPageParam: 1,
//     getNextPageParam: (lastPage) => lastPage.nextCursor,
//     enabled: !!user,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     });

//   const allInvoices = data?.pages.flatMap((page) => page.invoices) || [];
//   const totalPages = data?.pages[0]?.totalPages || 1;

//   // Use hook for filters
// const {customers} = useCustomers();
// const {organizations} = useOrganizations();

//   // Client-side filtering
//   const filteredInvoices = allInvoices.filter((invoice) => {
//     let matches = true;
//     if (filters.customer && filters.customer !== "all") {
//       matches =
//         matches &&
//         (invoice.customer?.name === filters.customer ||
//           invoice.billerName === filters.customer);
//     }
//     if (filters.organization && filters.organization !== "all") {
//       matches = matches && invoice.organization.name === filters.organization;
//     }
//     if (filters.status && filters.status !== "all") {
//       matches = matches && invoice.status === filters.status;
//     }
//     return matches;
//   });

//   if (isError) {
//     return <div>Error loading invoices. Please try refreshing.</div>;
//   }
//   const columns = createInvoiceColumns();

//   return (
//     <div className="p-6 w-screen">
//       <h1 className="text-3xl font-bold mb-6">Invoices</h1>
//       <Filters
//         filters={filters}
//         setFilters={setFilters}
//         customerOptions={customerOptions}
//         organizationOptions={organizationOptions}
//       />
//       <DataTable
//         columns={columns}
//         isLoading={isLoading}
//         data={filteredInvoices}
//         globalFilter={globalFilter}
//         setGlobalFilter={setGlobalFilter}
//         columnFilters={columnFilters}
//         setColumnFilters={setColumnFilters}
//         fetchNextPage={fetchNextPage}
//         hasNextPage={hasNextPage}
//         isFetchingNextPage={isFetchingNextPage}
//       />
//       <InvoiceForm user={user} refetch={refetch} />
//     </div>
//   );
// }

// interface FiltersProps {
//   filters: {
//     customer: string;
//     organization: string;
//     status: string;
//   };
//   setFilters: React.Dispatch<React.SetStateAction<Filters>>;
//   customerOptions: string[];
//   organizationOptions: string[];
// }

//  function Filters({
//   filters,
//   setFilters,
//   customerOptions,
//   organizationOptions,
// }: FiltersProps) {
//   const hasActiveFilters = Object.values(filters).some((filter) => filter !== '');

//   const clearFilter = (filterName: keyof typeof filters) => {
//     setFilters((prev) => ({
//       ...prev,
//       [filterName]: '',
//     }));
//   };

//   const clearAllFilters = () => {
//     setFilters({
//       customer: '',
//       organization: '',
//       status: '',
//     });
//   };

//   return (
//     <div className="bg-neutral-white shadow rounded-lg mb-6 p-4 border border-neutral-border">
//       <div className="flex items-center justify-between mb-3">
//         <div className="flex items-center gap-2">
//           <Filter className="h-4 w-4 text-navy-800" />
//           <h3 className="text-sm font-medium text-navy-800">Filter Invoices</h3>
//         </div>
//         <div className="flex items-center gap-2">
//           {hasActiveFilters && (
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={clearAllFilters}
//               className="text-xs text-neutral-text hover:text-accent-red"
//             >
//               Clear All
//             </Button>
//           )}
//           {/* Refresh can be added here if needed */}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <div>
//           <Select
//             value={filters.customer}
//             onValueChange={(value) =>
//               setFilters((prev) => ({ ...prev, customer: value }))
//             }
//           >
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Customer" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Customers</SelectItem>
//               {customerOptions.map((cust) => (
//                 <SelectItem key={cust} value={cust}>
//                   {cust}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div>
//           <Select
//             value={filters.organization}
//             onValueChange={(value) =>
//               setFilters((prev) => ({ ...prev, organization: value }))
//             }
//           >
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Organization" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Organizations</SelectItem>
//               {organizationOptions.map((org) => (
//                 <SelectItem key={org} value={org}>
//                   {org}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div>
//           <Select
//             value={filters.status}
//             onValueChange={(value) =>
//               setFilters((prev) => ({ ...prev, status: value }))
//             }
//           >
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Payment Status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Statuses</SelectItem>
//               <SelectItem value="COMPLETED">Completed</SelectItem>
//               <SelectItem value="PENDING">Pending</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {/* Active filters - desktop view */}
//       <div className="hidden sm:flex flex-wrap gap-2 mt-4">
//         {filters.customer && (
//           <Badge
//             variant="outline"
//             className="bg-neutral-light flex items-center gap-1"
//           >
//             Customer: {filters.customer}
//             <button onClick={() => clearFilter("customer")} className="ml-1">
//               <X className="h-3 w-3" />
//             </button>
//           </Badge>
//         )}
//         {filters.organization && (
//           <Badge
//             variant="outline"
//             className="bg-neutral-light flex items-center gap-1"
//           >
//             Organization: {filters.organization}
//             <button onClick={() => clearFilter("organization")} className="ml-1">
//               <X className="h-3 w-3" />
//             </button>
//           </Badge>
//         )}
//         {filters.status && (
//           <Badge
//             variant="outline"
//             className="bg-neutral-light flex items-center gap-1"
//           >
//             Status: {filters.status}
//             <button onClick={() => clearFilter("status")} className="ml-1">
//               <X className="h-3 w-3" />
//             </button>
//           </Badge>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import { ColumnFiltersState } from "@tanstack/react-table";

import InvoiceForm from "./InvoiceForm";
import { DataTable } from "./Data-Table";
import { createInvoiceColumns } from "./invoice-columns";
import { useCustomers, useOrganizations } from "@/hooks/useInvoiceFilters";

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
    return <div>Error loading invoices.</div>;
  }

  return (
    <div className="p-6 w-screen">
      <h1 className="text-3xl font-bold mb-6">Invoices</h1>
      <Link href="/dashboard/bills/new" className="mb-4 inline-block">
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          New Invoice
        </Button>
      </Link>
      <Filters
        filters={filters}
        setFilters={setFilters}
        isCustomerLoading={isCustomerLoading}
        isOrganizationLoading={isOrganizationLoading}
        isCustomerError={isCustomerError}
        isOrganizationError={isOrganizationError}
        customerOptions={customers as { customers: Customer[] }}
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { Customer, Organization } from "../../../../../generated/prisma";
import { useInvoices } from "@/hooks/invoice";
import Link from "next/link";

interface FiltersProps {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  customerOptions: { customers: Customer[] };
  organizationOptions: { organizations: Organization[] };
  isCustomerLoading: boolean;
  isOrganizationLoading: boolean;
  isCustomerError?: boolean;
  isOrganizationError?: boolean;
}
function Filters({
  filters,
  setFilters,
  customerOptions,
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
    <div className="bg-white shadow rounded-lg mb-6 p-4 border">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="text-sm font-medium">Filter Invoices</h3>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Customer */}
        <Select
          value={filters.customer}
          disabled={isCustomerLoading || isCustomerError}
          onValueChange={(v) => setFilters((p) => ({ ...p, customer: v }))}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                isCustomerLoading
                  ? "Loading customers..."
                  : isCustomerError
                  ? "Failed to load customers"
                  : "Customer"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {isCustomerLoading && (
              <SelectItem value="__loading" disabled>
                Loading...
              </SelectItem>
            )}

            {isCustomerError && (
              <SelectItem value="__error" disabled>
                Failed to load customers
              </SelectItem>
            )}

            {!isCustomerLoading &&
              !isCustomerError &&
              customerOptions.customers.map((c) => (
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
          <SelectTrigger>
            <SelectValue
              placeholder={
                isOrganizationLoading
                  ? "Loading organizations..."
                  : isOrganizationError
                  ? "Failed to load organizations"
                  : "Organization"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {isOrganizationLoading && (
              <SelectItem value="__loading" disabled>
                Loading...
              </SelectItem>
            )}

            {isOrganizationError && (
              <SelectItem value="__error" disabled>
                Failed to load organizations
              </SelectItem>
            )}

            {!isOrganizationLoading &&
              !isOrganizationError &&
              organizationOptions.organizations.map((o) => (
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
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(filters).map(
            ([key, value]) =>
              value && (
                <Badge
                  key={key}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {key}: {value}
                  <button
                    onClick={() => clearFilter(key as keyof FiltersState)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
          )}
        </div>
      )}
    </div>
  );
}
