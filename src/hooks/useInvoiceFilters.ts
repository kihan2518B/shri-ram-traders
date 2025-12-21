"use client";
import { useMemo, useState } from "react";

interface Filters {
  customer: string;
  organization: string;
  status: string;
}

export const useInvoiceFilters = (allInvoices: any[]) => {
  const [filters, setFilters] = useState<Filters>({
    customer: "",
    organization: "",
    status: "",
  });

  const customerOptions = useMemo(() => {
    const uniqueCustomers = Array.from(
      new Set(
        allInvoices
          .map((invoice) => invoice.customer?.name || invoice.billerName)
          .filter(Boolean)
      )
    );
    return ["all", ...uniqueCustomers];
  }, [allInvoices]);

  const organizationOptions = useMemo(() => {
    const uniqueOrgs = Array.from(
      new Set(allInvoices.map((invoice) => invoice.organization.name))
    );
    return ["all", ...uniqueOrgs];
  }, [allInvoices]);

  return { filters, setFilters, customerOptions, organizationOptions };
};
