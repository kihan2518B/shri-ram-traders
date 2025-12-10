"use client";
import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
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
  customer: { name: string };
  payments: PaymentLog[];
}

const generatePDF = (invoices: Invoice[], startDate: Date, endDate: Date) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Invoice Report", 20, 20);
  doc.setFontSize(12);
  const s = DateTime.fromJSDate(startDate).toFormat("MMM dd, yyyy");
  const e = DateTime.fromJSDate(endDate).toFormat("MMM dd, yyyy");
  doc.text(`Date Range: ${s} - ${e}`, 20, 30);

  const headers = [
    "Invoice #",
    "Date",
    "Organization",
    "Customer",
    "Type",
    "Total (₹)",
    "GST (₹)",
    "Grand Total (₹)",
  ];

  const data = invoices.map((inv) => [
    inv.invoiceNumber,
    inv.createdAt.split("T")[0],
    inv.organization.name,
    inv.customer?.name || "N/A",
    inv.invoiceType,
    inv.totalAmount.toFixed(2),
    inv.gstAmount.toFixed(2),
    inv.grandTotal.toFixed(2),
  ]);

  autoTable(doc, {
    startY: 40,
    head: [headers],
    body: data,
    theme: "striped",
    headStyles: { fillColor: [139, 85, 246], textColor: 255 },
    styles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  });

  doc.save(`invoice-report-${s.replace(/ /g, "")}-${e.replace(/ /g, "")}.pdf`);
};

const generateExcel = (invoices: Invoice[], startDate: Date, endDate: Date) => {
  const s = DateTime.fromJSDate(startDate).toFormat("MMM dd, yyyy");
  const e = DateTime.fromJSDate(endDate).toFormat("MMM dd, yyyy");
  const wsData = [
    ["Invoice Report"],
    [`Date Range: ${s} - ${e}`],
    [],
    [
      "Invoice #",
      "Date",
      "Organization",
      "Customer",
      "Type",
      "Total",
      "GST",
      "Grand Total",
      "Payment Status",
    ],
    ...invoices.map((inv) => {
      const paid = inv.payments.reduce(
        (sum, p) => sum + parseFloat(p.amount),
        0
      );
      const status = paid >= inv.grandTotal ? "COMPLETED" : "PENDING";
      return [
        inv.invoiceNumber,
        inv.createdAt.split("T")[0],
        inv.organization.name,
        inv.customer?.name || "N/A",
        inv.invoiceType,
        inv.totalAmount,
        inv.gstAmount,
        inv.grandTotal,
        status,
      ];
    }),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Invoices");
  XLSX.writeFile(wb, `invoice-report-${Date.now()}.xlsx`);
};

export default function InvoiceReport({
  dateRange,
  setDateRange,
  data,
  isLoading,
  isError,
}: {
  dateRange: [Date | null, Date | null];
  setDateRange: (dateRange: [Date | null, Date | null]) => void;
  data: { invoices: Invoice[] };
  isLoading: boolean;
  isError: boolean;
}) {
  const { data: organizations = [], isLoading: orgLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await axios.get("/api/organizations");
      return res.data.organizations;
    },
    staleTime: 1000 * 60 * 60 * 24 * 7, // cache 7 days
  });
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  console.log("data frm invoice: ", data);
  if (isLoading || !data) return <>Loading...</>;

  const filteredInvoices = selectedOrg
    ? data.invoices.filter((inv) => inv.organization.id === selectedOrg)
    : data.invoices;

  console.log("organizations: ", organizations);
  return (
    <div className="p-1 min-h-screen ">
      <Toaster />
      <div className="bg-slate-200rounded-xl shadow border border-border-DEFAULT dark:border-border-dark">
        <div className="p-6 bg-primary-500 text-black rounded-t-xl">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText /> Invoice Report
          </h1>
          <p className="text-sm">Generate and download reports by date range</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <label className="font-medium">Select Date Range</label>
            </div>
            <DatePicker
              selectsRange
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={(update) => setDateRange(update)}
              dateFormat="MMM dd, yyyy"
              maxDate={new Date()}
              className="border border-border-DEFAULT rounded-md px-3 py-2 bg-white"
            />

            <select
              value={selectedOrg || ""}
              onChange={(e) => setSelectedOrg(e.target.value || null)}
              className="border border-border-DEFAULT rounded-md px-3 py-2 bg-white"
            >
              <option value="">All Organizations</option>
              {organizations &&
                organizations.map((org: any) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
            </select>

            <Button
              onClick={() =>
                filteredInvoices &&
                generatePDF(filteredInvoices, dateRange[0]!, dateRange[1]!)
              }
              disabled={!filteredInvoices?.length}
            >
              <Download className="w-4 h-4 mr-1" /> PDF
            </Button>
            <Button
              onClick={() =>
                filteredInvoices &&
                generateExcel(filteredInvoices, dateRange[0]!, dateRange[1]!)
              }
              disabled={!filteredInvoices?.length}
            >
              <FileSpreadsheet className="w-4 h-4 mr-1" /> Excel
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="animate-spin w-6 h-6" /> Loading...
            </div>
          ) : isError ? (
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
                    <th className="p-2">Invoice #</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Organization</th>
                    <th className="p-2">Customer</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Total (₹)</th>
                    <th className="p-2">GST (₹)</th>
                    <th className="p-2">Grand Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices?.map((inv) => {
                    const paid = inv.payments.reduce(
                      (sum, p) => sum + parseFloat(p.amount),
                      0
                    );
                    const status =
                      paid >= inv.grandTotal ? "COMPLETED" : "PENDING";
                    return (
                      <tr key={inv.id} className="border-t">
                        <td className="p-2">{inv.invoiceNumber}</td>
                        <td className="p-2">{inv.createdAt.split("T")[0]}</td>
                        <td className="p-2">{inv.organization.name}</td>
                        <td className="p-2">{inv.customer?.name || "N/A"}</td>
                        <td className="p-2">{inv.invoiceType}</td>
                        <td className="p-2 text-right">
                          {inv.totalAmount.toLocaleString("en-In")}
                        </td>
                        <td className="p-2 text-right">
                          {inv.gstAmount.toLocaleString("en-In")}
                        </td>
                        <td className="p-2 text-right">
                          {inv.grandTotal.toLocaleString("en-In")}
                        </td>
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
