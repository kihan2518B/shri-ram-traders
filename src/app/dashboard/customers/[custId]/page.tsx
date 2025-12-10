"use client";

import React, { useState } from "react";
import {
  FileText,
  MapPin,
  CheckCircle,
  Clock,
  Calendar,
  Menu,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AnalyticsCards, CustomerHeader } from "./helper";
import Link from "next/link";

// Utility Functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const daysAgo = (dateString: string) => {
  const today = new Date();
  const invoiceDate = new Date(dateString);
  const diffTime = Math.abs(today.getTime() - invoiceDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Utility Types
type Invoice = {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  vehicalNumber: string;
  grandTotal: number;
  status: string;
  invoiceType: string;
};

interface MobileTabNavigationProps {
  activeTab: any;
  setActiveTab: any;
  pendingInvoices: Invoice[];
  paidInvoices: Invoice[];
  invoices: Invoice[];
}

// Component: MobileTabNavigation
const MobileTabNavigation = ({
  activeTab,
  setActiveTab,
  pendingInvoices,
  paidInvoices,
  invoices,
}: MobileTabNavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="sm:hidden bg-white shadow-sm border-b border-gray-200">
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-4 py-3 text-navy-700"
          >
            {activeTab === "pending" && "Pending Invoices"}
            {activeTab === "completed" && "Completed Invoices"}
            {activeTab === "all" && "All Invoices"}
            {activeTab === "info" && "Customer Information"}
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
          <SheetHeader className="border-b pb-4 mb-4">
            <SheetTitle>Select a Tab</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4">
            {[
              {
                value: "pending",
                label: "Pending Invoices",
                count: pendingInvoices.length,
              },
              {
                value: "completed",
                label: "Completed Invoices",
                count: paidInvoices.length,
              },
              {
                value: "all",
                label: "All Invoices",
                count: invoices.length,
              },
              {
                value: "info",
                label: "Customer Information",
                count: null,
              },
            ].map((tab) => (
              <Button
                key={tab.value}
                variant={activeTab === tab.value ? "default" : "outline"}
                onClick={() => {
                  setActiveTab(tab.value);
                  setMobileMenuOpen(false);
                }}
                className="w-full"
              >
                {tab.label} {tab.count !== null && `(${tab.count})`}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

// Component: MobileInvoiceList
interface MobileInvoiceListProps {
  invoices: Invoice[];
  emptyStateIcon: React.ComponentType<React.ComponentProps<"svg">>;
  emptyStateTitle: string;
  emptyStateDescription: string;
  statusFilter?: string;
}
const MobileInvoiceList = ({
  invoices,
  emptyStateIcon: EmptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  statusFilter,
}: MobileInvoiceListProps) => {
  const filteredInvoices = statusFilter
    ? invoices.filter((inv) => inv.status === statusFilter)
    : invoices;

  if (filteredInvoices.length === 0) {
    return (
      <div className="text-center p-6 bg-white rounded-lg">
        <EmptyStateIcon className="mx-auto w-12 h-12 text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-navy-800 mb-1">
          {emptyStateTitle}
        </h3>
        <p className="text-gray-600">{emptyStateDescription}</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {filteredInvoices.map((invoice) => (
        <div
          key={invoice.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-navy-800">
                {invoice.invoiceNumber}
              </h3>
              <p className="text-xs text-gray-600">
                {formatDate(invoice.createdAt)} ({daysAgo(invoice.createdAt)}{" "}
                days ago)
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                invoice.status === "PENDING"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }
            >
              {invoice.status === "PENDING" ? (
                <>
                  <Clock size={12} className="mr-1" />
                  Pending
                </>
              ) : (
                <>
                  <CheckCircle size={12} className="mr-1" />
                  Paid
                </>
              )}
            </Badge>
          </div>
          <div className="flex justify-between items-end mt-3">
            <p className="text-gray-600">{invoice.vehicalNumber}</p>
            <div className="text-right">
              <p
                className={`font-semibold ${
                  invoice.invoiceType === "Credit"
                    ? "text-blue-900"
                    : "text-purple-900"
                }`}
              >
                ₹
                {invoice.grandTotal.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </p>
              {invoice.invoiceType !== "Credit" && (
                <p className="text-xs text-gray-500">Refund</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Page Component
export default function CustomerDetailsPage() {
  const { custId } = useParams();
  const [activeTab, setActiveTab] = useState("pending");

  const { data: customer } = useQuery({
    queryKey: ["customerDetails"],
    queryFn: () =>
      axios.get(`/api/customers/${custId}`).then((res) => res.data.customer),
    enabled: !!custId,
  });

  if (!customer) return <div>Loading...</div>;

  const invoices = customer.invoices as Invoice[];
  const pendingInvoices = invoices.filter((inv) => inv.status === "PENDING");
  const paidInvoices = invoices.filter((inv) => inv.status === "COMPLETED");

  const analytics = {
    totalBilled: invoices
      .filter((inv) => inv.invoiceType === "Credit")
      .reduce((sum, inv) => sum + inv.grandTotal, 0),
    totalRefunded: invoices
      .filter((inv) => inv.invoiceType === "Debit")
      .reduce((sum, inv) => sum + inv.grandTotal, 0),
    pendingAmount: pendingInvoices
      .filter((inv) => inv.invoiceType === "Credit")
      .reduce((sum, inv) => sum + inv.grandTotal, 0),
    totalInvoices: invoices.length,
    pendingInvoices: pendingInvoices.length,
    completedInvoices: paidInvoices.length,
    latestInvoiceDate:
      invoices.length > 0
        ? new Date(
            Math.max(
              ...invoices.map((inv) => new Date(inv.createdAt).getTime())
            )
          ).toLocaleDateString()
        : "N/A",
    avgInvoiceValue:
      invoices.length > 0
        ? invoices
            .filter((inv) => inv.invoiceType === "Credit")
            .reduce((sum, inv) => sum + inv.grandTotal, 0) /
          invoices.filter((inv) => inv.invoiceType === "Credit").length
        : 0,
  };

  return (
    <div className="min-h-screen w-full bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <CustomerHeader customer={customer} />
        <AnalyticsCards analytics={analytics} />
        {/* Tabs for Desktop */}
        <Tabs
          defaultValue="pending"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-4 sm:mt-6 hidden sm:block"
        >
          <TabsList className="bg-white w-full sm:w-auto justify-start overflow-x-auto">
            <TabsTrigger value="pending" className="text-navy-700">
              Pending Invoices ({pendingInvoices.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-navy-700">
              Completed Invoices ({paidInvoices.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="text-navy-700">
              All Invoices ({invoices.length})
            </TabsTrigger>
            <TabsTrigger value="info" className="text-navy-700">
              Customer Information
            </TabsTrigger>
          </TabsList>
          {/* Pending Invoices Tab */}
          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-navy-800">
                    Pending Invoices
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-700 bg-white"
                  >
                    <Download size={14} className="mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {pendingInvoices.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingInvoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                              {invoice.invoiceNumber}
                            </TableCell>
                            <TableCell>
                              <div>{formatDate(invoice.createdAt)}</div>
                              <div className="text-xs text-gray-500">
                                {daysAgo(invoice.createdAt)} days ago
                              </div>
                            </TableCell>
                            <TableCell>{invoice.vehicalNumber}</TableCell>
                            <TableCell className="text-right">
                              ₹
                              {invoice.grandTotal.toLocaleString("en-IN", {
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 border-amber-200"
                              >
                                <Clock size={12} className="mr-1" />
                                Pending
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">View invoice</span>
                                <Link
                                  href={`/dashboard/bills/${invoice.id}`}
                                  className=""
                                >
                                  View
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium text-navy-800 mb-1">
                      No Pending Invoices
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      This customer has no pending invoices. All payments are up
                      to date.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Invoices Tab */}
          <TabsContent value="completed" className="mt-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-navy-800">
                    Completed Invoices
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-700 bg-white"
                  >
                    <Download size={14} className="mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {paidInvoices.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paidInvoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                              {invoice.invoiceNumber}
                            </TableCell>
                            <TableCell>
                              <div>{formatDate(invoice.createdAt)}</div>
                              <div className="text-xs text-gray-500">
                                {daysAgo(invoice.createdAt)} days ago
                              </div>
                            </TableCell>
                            <TableCell>{invoice.vehicalNumber}</TableCell>
                            <TableCell className="text-right">
                              ₹
                              {invoice.grandTotal.toLocaleString("en-IN", {
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                <CheckCircle size={12} className="mr-1" />
                                Paid
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">View invoice</span>
                                <Link
                                  href={`/dashboard/bills/${invoice.id}`}
                                  className=""
                                >
                                  View
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-navy-800 mb-1">
                      No Completed Invoices
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      This customer hasn't completed any invoices yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Invoices Tab */}
          <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-navy-800">
                    All Invoices
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-700 bg-white"
                  >
                    <Download size={14} className="mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            <div>{formatDate(invoice.createdAt)}</div>
                            <div className="text-xs text-gray-500">
                              {daysAgo(invoice.createdAt)} days ago
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                invoice.invoiceType === "Credit"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-purple-50 text-purple-700 border-purple-200"
                              }
                            >
                              {invoice.invoiceType}
                            </Badge>
                          </TableCell>
                          <TableCell>{invoice.vehicalNumber}</TableCell>
                          <TableCell className="text-right">
                            ₹
                            {invoice.grandTotal.toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                invoice.status === "PENDING"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-green-50 text-green-700 border-green-200"
                              }
                            >
                              {invoice.status === "PENDING" ? (
                                <>
                                  <Clock size={12} className="mr-1" />
                                  Pending
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={12} className="mr-1" />
                                  Paid
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">View invoice</span>
                              <Link
                                href={`/dashboard/bills/${invoice.id}`}
                                className=""
                              >
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customer Information Tab */}
          <TabsContent value="info" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-navy-800">
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">
                          Customer Name
                        </h3>
                        <p className="text-navy-900 font-medium">
                          {customer.name}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">
                          GST Number
                        </h3>
                        <p className="text-navy-900 font-medium">
                          {customer.gstNumber || "—"}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">
                          Address
                        </h3>
                        <p className="text-navy-900 font-medium flex items-start">
                          <MapPin
                            size={16}
                            className="mr-1 mt-1 flex-shrink-0 text-gray-400"
                          />
                          <span>{customer.address || "—"}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-3">
                      Billing Summary
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Billed:</span>
                        <span className="font-medium text-navy-900">
                          ₹
                          {analytics.totalBilled.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Refunded:</span>
                        <span className="font-medium text-navy-900">
                          ₹
                          {analytics.totalRefunded.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2 border-gray-200">
                        <span className="text-gray-600">
                          Outstanding Amount:
                        </span>
                        <span className="font-medium text-navy-900">
                          ₹
                          {analytics.pendingAmount.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-600 mb-3">
                        Customer Since
                      </h3>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-navy-600 mr-2" />
                        <span className="text-navy-900">
                          {formatDate(customer.createdAt)} (
                          {daysAgo(customer.createdAt)} days)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <MobileTabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingInvoices={pendingInvoices}
          paidInvoices={paidInvoices}
          invoices={invoices}
        />

        <div className="sm:hidden">
          {activeTab === "pending" && (
            <MobileInvoiceList
              invoices={invoices}
              emptyStateIcon={CheckCircle}
              emptyStateTitle="No Pending Invoices"
              emptyStateDescription="This customer has no pending invoices."
              statusFilter="PENDING"
            />
          )}
          {activeTab === "completed" && (
            <MobileInvoiceList
              invoices={invoices}
              emptyStateIcon={FileText}
              emptyStateTitle="No Completed Invoices"
              emptyStateDescription="This customer hasn't completed any invoices yet."
              statusFilter="PAID"
            />
          )}
          {activeTab === "all" && (
            <MobileInvoiceList
              invoices={invoices}
              emptyStateIcon={FileText}
              emptyStateTitle="No Invoices"
              emptyStateDescription="No invoices found for this customer."
            />
          )}
          {/* Customer Information Tab for Mobile */}
          {activeTab === "info" && (
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  Customer Name
                </h3>
                <p className="text-navy-900 font-medium">{customer.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  GST Number
                </h3>
                <p className="text-navy-900 font-medium">
                  {customer.gstNumber || "—"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  Address
                </h3>
                <p className="text-navy-900 font-medium flex items-start">
                  <MapPin
                    size={16}
                    className="mr-1 mt-1 flex-shrink-0 text-gray-400"
                  />
                  <span>{customer.address || "—"}</span>
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Billed:</span>
                  <span className="font-medium text-navy-900">
                    ₹
                    {analytics.totalBilled.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Refunded:</span>
                  <span className="font-medium text-navy-900">
                    ₹
                    {analytics.totalRefunded.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
