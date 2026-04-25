"use client";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DateTime } from "luxon";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Download,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  FileText,
  SlidersHorizontal,
} from "lucide-react";
import autoTable from "jspdf-autotable";

interface PaymentLog {
  amount: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  invoiceType: string;
  totalAmount: number;
  gstAmount: number;
  grandTotal: number;
  organization: { name: string; id: string };
  customer: { name: string } | null;
  payments: PaymentLog[];
}

interface Customer {
  id: string;
  name: string;
}

// ─── Column definitions ────────────────────────────────────────────────────
const ALL_COLUMNS = [
  { key: "invoiceNumber", label: "Invoice #" },
  { key: "date", label: "Date" },
  { key: "organization", label: "Organization" },
  { key: "customer", label: "Customer" },
  { key: "type", label: "Type" },
  { key: "totalAmount", label: "Total (₹)" },
  { key: "gstAmount", label: "GST (₹)" },
  { key: "grandTotal", label: "Grand Total (₹)" },
  { key: "paidAmount", label: "Paid (₹)" },
] as const;

type ColKey = (typeof ALL_COLUMNS)[number]["key"];

type VisibleCols = Record<ColKey, boolean>;

const DEFAULT_VISIBLE: VisibleCols = {
  invoiceNumber: true,
  date: true,
  organization: true,
  customer: true,
  type: true,
  totalAmount: true,
  gstAmount: true,
  grandTotal: true,
  paidAmount: true,
};

// ─── Helpers ───────────────────────────────────────────────────────────────
const paidAmount = (inv: Invoice) =>
  inv.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

const rowValues = (inv: Invoice): Record<ColKey, string | number> => ({
  invoiceNumber: inv.invoiceNumber,
  date: inv.createdAt.split("T")[0],
  organization: inv.organization.name,
  customer: inv.customer?.name || "N/A",
  type: inv.invoiceType,
  totalAmount: inv.totalAmount,
  gstAmount: inv.gstAmount,
  grandTotal: inv.grandTotal,
  paidAmount: paidAmount(inv),
});

// ─── PDF ───────────────────────────────────────────────────────────────────
const generatePDF = (
  invoices: Invoice[],
  startDate: Date,
  endDate: Date,
  visible: VisibleCols,
) => {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(13);
  doc.text("Invoice Report", 14, 14);
  doc.setFontSize(9);
  const s = DateTime.fromJSDate(startDate).toFormat("MMM dd, yyyy");
  const e = DateTime.fromJSDate(endDate).toFormat("MMM dd, yyyy");
  doc.text(`Date Range: ${s} – ${e}`, 14, 21);

  const activeCols = ALL_COLUMNS.filter((c) => visible[c.key]);
  const headers = activeCols.map((c) => c.label);

  const data = invoices.map((inv) => {
    const vals = rowValues(inv);
    return activeCols.map((c) => {
      const v = vals[c.key];
      return typeof v === "number" ? (v as number).toFixed(2) : String(v);
    });
  });

  autoTable(doc, {
    startY: 28,
    head: [headers],
    body: data,
    theme: "striped",
    headStyles: {
      fillColor: [139, 85, 246],
      textColor: 255,
      fontSize: 7,
      fontStyle: "bold",
      halign: "center",
    },
    styles: {
      fontSize: 6.5,
      cellPadding: 2,
      overflow: "linebreak",
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: 10, right: 10 },
  });

  doc.save(`invoice-report-${s.replace(/ /g, "")}-${e.replace(/ /g, "")}.pdf`);
};

// ─── Excel ─────────────────────────────────────────────────────────────────
const generateExcel = (
  invoices: Invoice[],
  startDate: Date,
  endDate: Date,
  visible: VisibleCols,
) => {
  const s = DateTime.fromJSDate(startDate).toFormat("MMM dd, yyyy");
  const e = DateTime.fromJSDate(endDate).toFormat("MMM dd, yyyy");

  const activeCols = ALL_COLUMNS.filter((c) => visible[c.key]);
  const headers = activeCols.map((c) => c.label);

  const wsData = [
    ["Invoice Report"],
    [`Date Range: ${s} – ${e}`],
    [],
    headers,
    ...invoices.map((inv) => {
      const vals = rowValues(inv);
      return activeCols.map((c) => vals[c.key]);
    }),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Invoices");
  XLSX.writeFile(wb, `invoice-report-${Date.now()}.xlsx`);
};

// ─── Component ─────────────────────────────────────────────────────────────
export default function InvoiceReport({
  dateRange,
  setDateRange,
  data,
  isLoading,
  isError,
}: {
  dateRange: [Date | null, Date | null];
  setDateRange: (dateRange: [Date | null, Date | null]) => void;
  data: { invoices: Invoice[]; customers?: Customer[] };
  isLoading: boolean;
  isError: boolean;
}) {
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [visibleCols, setVisibleCols] = useState<VisibleCols>(DEFAULT_VISIBLE);
  const [showColPicker, setShowColPicker] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading...
      </div>
    );
  }

  // Derive unique orgs from invoices
  const orgMap = new Map<string, string>();
  data.invoices.forEach((inv) =>
    orgMap.set(inv.organization.id, inv.organization.name),
  );
  const organizations = Array.from(orgMap.entries()).map(([id, name]) => ({
    id,
    name,
  }));

  const customers: Customer[] = data.customers ?? [];

  const filteredInvoices = data.invoices
    .filter((inv) => !selectedOrg || inv.organization.id === selectedOrg)
    .filter(
      (inv) => !selectedCustomer || inv.customer?.name === selectedCustomer,
    );

  // For customer dropdown, use customers from API; fall back to unique names from invoices
  const customerOptions: Customer[] =
    customers.length > 0
      ? customers
      : Array.from(
          new Map(
            data.invoices
              .filter((inv) => inv.customer)
              .map((inv) => [
                inv.customer!.name,
                { id: inv.customer!.name, name: inv.customer!.name },
              ]),
          ).values(),
        );

  const toggleCol = (key: ColKey) =>
    setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }));

  const activeCols = ALL_COLUMNS.filter((c) => visibleCols[c.key]);

  return (
    <div className="p-1 min-h-screen">
      <Toaster />
      <div className="bg-slate-200 rounded-xl shadow border border-border-DEFAULT dark:border-border-dark">
        {/* Header */}
        <div className="p-6 bg-primary-500 text-black rounded-t-xl">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText /> Invoice Report
          </h1>
          <p className="text-sm">Generate and download reports by date range</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Filter row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Date range */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <label className="font-medium">Select Date Range</label>
            </div>
            <DatePicker
              selectsRange
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={(update) =>
                setDateRange(update as [Date | null, Date | null])
              }
              dateFormat="MMM dd, yyyy"
              maxDate={new Date()}
              className="border border-border-DEFAULT rounded-md px-3 py-2 bg-white"
            />

            {/* Organization filter */}
            <select
              value={selectedOrg || ""}
              onChange={(e) => setSelectedOrg(e.target.value || null)}
              className="border border-border-DEFAULT rounded-md px-3 py-2 bg-white"
            >
              <option value="">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>

            {/* Customer filter */}
            <select
              value={selectedCustomer || ""}
              onChange={(e) => setSelectedCustomer(e.target.value || null)}
              className="border border-border-DEFAULT rounded-md px-3 py-2 bg-white"
            >
              <option value="">All Customers</option>
              {customerOptions.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Column picker toggle */}
            <Button
              variant="outline"
              onClick={() => setShowColPicker((p) => !p)}
              className="flex items-center gap-1"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Columns
            </Button>

            {/* Export buttons */}
            <Button
              onClick={() =>
                filteredInvoices &&
                generatePDF(
                  filteredInvoices,
                  dateRange[0]!,
                  dateRange[1]!,
                  visibleCols,
                )
              }
              disabled={!filteredInvoices?.length}
            >
              <Download className="w-4 h-4 mr-1" /> PDF
            </Button>
            <Button
              onClick={() =>
                filteredInvoices &&
                generateExcel(
                  filteredInvoices,
                  dateRange[0]!,
                  dateRange[1]!,
                  visibleCols,
                )
              }
              disabled={!filteredInvoices?.length}
            >
              <FileSpreadsheet className="w-4 h-4 mr-1" /> Excel
            </Button>
          </div>

          {/* Column visibility picker */}
          {showColPicker && (
            <div className="flex flex-wrap gap-2 p-3 bg-white border border-border-DEFAULT rounded-lg shadow-sm">
              {ALL_COLUMNS.map((col) => (
                <label
                  key={col.key}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-colors ${
                    visibleCols[col.key]
                      ? "bg-primary-500 border-primary-500 text-black"
                      : "bg-white border-gray-300 text-gray-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={visibleCols[col.key]}
                    onChange={() => toggleCol(col.key)}
                  />
                  {col.label}
                </label>
              ))}
            </div>
          )}

          {/* Table / states */}
          {isError ? (
            <div className="text-center text-red-500 py-8">
              <AlertCircle className="w-6 h-6 inline mr-2" />
              Error loading invoices.
            </div>
          ) : filteredInvoices?.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              No invoices found.
            </div>
          ) : (
            <div className="overflow-x-auto border border-border-DEFAULT dark:border-border-dark rounded">
              <table className="w-full text-sm">
                <thead className="bg-primary-500 text-black">
                  <tr>
                    {activeCols.map((col) => (
                      <th key={col.key} className="p-2 whitespace-nowrap">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices?.map((inv) => {
                    const vals = rowValues(inv);
                    return (
                      <tr key={inv.id} className="border-t">
                        {activeCols.map((col) => {
                          const v = vals[col.key];
                          const isNum = typeof v === "number";
                          return (
                            <td
                              key={col.key}
                              className={`p-2 ${isNum ? "text-right" : ""}`}
                            >
                              {isNum
                                ? (v as number).toLocaleString("en-IN")
                                : String(v)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
