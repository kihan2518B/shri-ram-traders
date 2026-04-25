"use client";
import React, { useState } from "react";
import { DateTime } from "luxon";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  FileText,
  SlidersHorizontal,
  Building2,
  UserCircle2,
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
      fillColor: [100, 116, 139], // slate-500
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
    alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
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
  data,
  isLoading,
  isError,
}: {
  dateRange: [Date | null, Date | null];
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
      <div className="flex justify-center items-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
        <Loader2 className="animate-spin w-8 h-8 mr-3 text-primary-500" />
        <span className="text-slate-600 font-medium">Loading invoices...</span>
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <Toaster />

      {/* Header and Toolbar - Minimal styling */}
      <div className="p-4 md:p-6 border-b border-slate-200 bg-white space-y-4">
        {/* Title & Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Invoice List
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Detailed breakdown of generated invoices
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto mt-2 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColPicker((p) => !p)}
              className="flex items-center gap-1 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Columns</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
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
              className="bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1" />
              <span>Excel</span>
            </Button>
            <Button
              size="sm"
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
              className="bg-primary hover:bg-primary/80 text-white flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-1" />
              <span>PDF</span>
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row gap-3 pt-2">
          {/* Org Filter */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Building2 className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={selectedOrg || ""}
              onChange={(e) => setSelectedOrg(e.target.value || null)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Filter */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <UserCircle2 className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={selectedCustomer || ""}
              onChange={(e) => setSelectedCustomer(e.target.value || null)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Customers</option>
              {customerOptions.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Column Picker Panel */}
        {showColPicker && (
          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-inner mt-4 transition-all">
            {ALL_COLUMNS.map((col) => (
              <label
                key={col.key}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-colors select-none ${
                  visibleCols[col.key]
                    ? "bg-slate-200 border-slate-300 text-slate-800"
                    : "bg-white border-slate-200 text-slate-400"
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
      </div>

      {/* Table Content */}
      <div className="flex-1 bg-white">
        {isError ? (
          <div className="flex flex-col items-center justify-center text-red-500 py-12">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="font-medium">Error loading invoices</p>
          </div>
        ) : filteredInvoices?.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText className="w-12 h-12 mx-auto text-slate-200 mb-3" />
            <p className="text-base font-medium text-slate-500">
              No invoices found
            </p>
            <p className="text-sm mt-1">
              Try adjusting your filters or date range.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  {activeCols.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 font-semibold whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices?.map((inv) => {
                  const vals = rowValues(inv);
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {activeCols.map((col) => {
                        const v = vals[col.key];
                        const isNum = typeof v === "number";
                        return (
                          <td
                            key={col.key}
                            className={`px-4 py-3 text-slate-700 whitespace-nowrap ${
                              isNum ? "font-medium" : ""
                            }`}
                          >
                            {isNum ? (
                              <div className="flex justify-start">
                                <span>
                                  ₹{(v as number).toLocaleString("en-IN")}
                                </span>
                              </div>
                            ) : (
                              String(v)
                            )}
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
  );
}
