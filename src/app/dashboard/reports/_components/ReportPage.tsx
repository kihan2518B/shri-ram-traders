"use client";
import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { useQuery } from "@tanstack/react-query";
import InvoiceReport from "./InvoiceReport";
import RevenueReport from "./RevenueReport";

const fetchReport = async (dateRange: [Date | null, Date | null]) => {
  if (!dateRange[0] || !dateRange[1]) return;

  // Clamp to full local day so boundary dates are always included
  const start = new Date(dateRange[0]);
  start.setHours(0, 0, 0, 0);

  const end = new Date(dateRange[1]);
  end.setHours(23, 59, 59, 999);

  const res = await fetch(
    `/api/report?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
  );
  const data = await res.json();
  return data;
};

export default function ReportPage() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    DateTime.now().minus({ days: 30 }).toJSDate(),
    DateTime.now().toJSDate(),
  ]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["report"],
    queryFn: () => fetchReport(dateRange),
    enabled: !!dateRange[0] && !!dateRange[1],
  });

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) refetch();
  }, [dateRange, refetch]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <RevenueReport
        report={data}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
      <InvoiceReport
        data={data}
        isError={isError}
        isLoading={isLoading}
        dateRange={dateRange}
      />
    </div>
  );
}
