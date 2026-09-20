"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useOrganizations } from "@/hooks/useInvoiceFilters";
import { TableSkeleton } from "@/components/common/Skeletons";
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Box, DollarSign } from "lucide-react";

export default function BalanceSheetPage() {
  const [selectedOrg, setSelectedOrg] = useState("all");
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: orgData } = useOrganizations();
  const organizations = orgData?.organizations || [];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["balance-sheet", selectedOrg, asOfDate],
    queryFn: async () => {
      const res = await axios.get("/api/balance-sheet", {
        params: { orgId: selectedOrg, asOfDate },
      });
      return res.data;
    },
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Balance Sheet</h1>
          <p className="text-sm text-gray-500">Summary of Payables, Receivables, and Stock Valuation up to selected date</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-48">
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="All Organizations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations.map((org: any) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-40 bg-white"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : isError ? (
        <div className="p-6 bg-red-50 text-red-700 rounded-lg">Error loading Balance Sheet data. Please try again.</div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-emerald-100 bg-emerald-50/40">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-emerald-800">Accounts Receivable</CardTitle>
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-900">₹{data.totalReceivables.toLocaleString("en-IN")}</div>
                <p className="text-xs text-emerald-600 mt-1">Pending from Customers (Sales)</p>
              </CardContent>
            </Card>

            <Card className="border-amber-100 bg-amber-50/40">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-amber-800">Accounts Payable</CardTitle>
                <ArrowUpRight className="w-5 h-5 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-900">₹{data.totalPayables.toLocaleString("en-IN")}</div>
                <p className="text-xs text-amber-600 mt-1">Pending to Vendors (Purchases)</p>
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-blue-50/40">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-800">Stock Valuation</CardTitle>
                <Box className="w-5 h-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">₹{data.totalStockValuation.toLocaleString("en-IN")}</div>
                <p className="text-xs text-blue-600 mt-1">Total Value of Stock on Hand</p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 bg-purple-50/40">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-800">Net Working Assets</CardTitle>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">₹{data.netAssets.toLocaleString("en-IN")}</div>
                <p className="text-xs text-purple-600 mt-1">Stock + Receivables - Payables</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accounts Receivable */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  <span>Accounts Receivable</span>
                  <span className="text-sm text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                    ₹{data.totalReceivables.toLocaleString("en-IN")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead className="text-center">Pending Invoices</TableHead>
                        <TableHead className="text-right">Amount Owed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.receivables.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-gray-500">No pending customer receivables</TableCell>
                        </TableRow>
                      ) : (
                        data.receivables.map((item: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium text-gray-900">{item.customerName}</TableCell>
                            <TableCell className="text-center">{item.invoiceCount}</TableCell>
                            <TableCell className="text-right font-semibold text-emerald-700">₹{item.amount.toLocaleString("en-IN")}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Accounts Payable */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  <span>Accounts Payable</span>
                  <span className="text-sm text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full font-bold">
                    ₹{data.totalPayables.toLocaleString("en-IN")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor / Customer Name</TableHead>
                        <TableHead className="text-center">Pending Invoices</TableHead>
                        <TableHead className="text-right">Amount to Pay</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.payables.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-gray-500">No pending vendor payables</TableCell>
                        </TableRow>
                      ) : (
                        data.payables.map((item: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium text-gray-900">{item.customerName}</TableCell>
                            <TableCell className="text-center">{item.invoiceCount}</TableCell>
                            <TableCell className="text-right font-semibold text-amber-700">₹{item.amount.toLocaleString("en-IN")}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stock Valuation Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                <span>Stock on Hand Valuation</span>
                <span className="text-sm text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full font-bold">
                  Total Valuation: ₹{data.totalStockValuation.toLocaleString("en-IN")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product / Material</TableHead>
                      <TableHead className="text-center">Unit</TableHead>
                      <TableHead className="text-right">Remaining Stock Qty</TableHead>
                      <TableHead className="text-right">Avg Purchase Price</TableHead>
                      <TableHead className="text-right">Total Valuation (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.stockOnHandItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">No stock history recorded</TableCell>
                      </TableRow>
                    ) : (
                      data.stockOnHandItems.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-semibold text-gray-900">{item.name}</TableCell>
                          <TableCell className="text-center">{item.unit}</TableCell>
                          <TableCell className="text-right">{item.remainingQty}</TableCell>
                          <TableCell className="text-right">₹{item.avgCostPrice}</TableCell>
                          <TableCell className="text-right font-bold text-blue-700">₹{item.totalValuation.toLocaleString("en-IN")}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

