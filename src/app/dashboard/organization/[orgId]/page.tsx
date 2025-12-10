import prisma from "@/lib/prisma";
import OrganizationHeader from "@/components/OrganizationHeader";
import Image from "next/image";
import {
  CreditCard,
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  Building2,
  Landmark,
  MapPin,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Invoice } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";

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

export default async function Page({ params }: { params: { orgId: string } }) {
  const orgId = params.orgId;

  // Fetch organization details
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      invoices: {
        include: {
          customer: true,
        },
      },
    },
  });

  if (!org) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription className="flex items-center">
            Sorry, we can't find your organization. Please check the URL or
            contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fetch analytics data
  const creditStats = await prisma.invoice.aggregate({
    where: {
      organizationId: orgId,
      invoiceType: "Credit",
    },
    _sum: { totalAmount: true },
    _count: { _all: true },
  });

  const debitStats = await prisma.invoice.aggregate({
    where: {
      organizationId: orgId,
      invoiceType: "Debit",
    },
    _sum: { totalAmount: true },
    _count: { _all: true },
  });

  const totalInvoices = await prisma.invoice.count({
    where: { organizationId: orgId },
  });

  const uniqueCustomers = await prisma.invoice.findMany({
    where: { organizationId: orgId },
    select: { customerId: true },
    distinct: ["customerId"],
  });

  const analytics = {
    creditTotal: creditStats._sum.totalAmount || 0,
    debitTotal: debitStats._sum.totalAmount || 0,
    creditCount: creditStats._count._all || 0,
    debitCount: debitStats._count._all || 0,
    totalInvoices,
    uniqueCustomerCount: uniqueCustomers.length,
  };
  const viewInvoice = (id: string) => {
    redirect(`/dashboard/bills/${id}`);
  };
  return (
    <div className="min-h-screen w-full bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Organization Header */}
        <OrganizationHeader org={org} />

        {/* Main Content */}
        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="bg-white w-full sm:w-auto justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="text-navy-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="details" className="text-navy-700">
              Organization Details
            </TabsTrigger>
            <TabsTrigger value="credit-invoices" className="text-navy-700">
              Credit Invoices
            </TabsTrigger>
            <TabsTrigger value="debit-invoices" className="text-navy-700">
              Debit Invoices
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <h2 className="text-xl font-semibold text-navy-800 mb-4">
              Financial Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Credit Revenue
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">
                    ₹
                    {analytics.creditTotal.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    From {analytics.creditCount} invoices
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Debit Revenue
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">
                    ₹
                    {analytics.debitTotal.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    From {analytics.debitCount} invoices
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Net Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-navy-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">
                    ₹
                    {(
                      analytics.creditTotal - analytics.debitTotal
                    ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Net balance</p>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-xl font-semibold text-navy-800 mt-8 mb-4">
              Business Metrics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Invoices
                  </CardTitle>
                  <FileText className="h-4 w-4 text-navy-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">
                    {analytics.totalInvoices}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Unique Customers
                  </CardTitle>
                  <Users className="h-4 w-4 text-navy-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">
                    {analytics.uniqueCustomerCount}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Avg. Invoice Value
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-navy-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">
                    ₹
                    {analytics.totalInvoices
                      ? (
                          analytics.creditTotal / analytics.totalInvoices
                        ).toLocaleString("en-IN", { maximumFractionDigits: 2 })
                      : "0.00"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Revenue per Customer
                  </CardTitle>
                  <Users className="h-4 w-4 text-navy-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">
                    ₹
                    {analytics.uniqueCustomerCount
                      ? (
                          analytics.creditTotal / analytics.uniqueCustomerCount
                        ).toLocaleString("en-IN", { maximumFractionDigits: 2 })
                      : "0.00"}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Organization Details Tab */}
          <TabsContent value="details" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  {org.logo ? (
                    <div className="flex items-center justify-center">
                      <Image
                        width={200}
                        height={200}
                        src={org.logo}
                        alt={`${org.name} logo`}
                        className="rounded-lg object-contain h-48 w-auto"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center bg-gray-100 h-48 rounded-lg">
                      <Building2 size={48} className="text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="md:w-2/3">
                  <h2 className="text-xl font-semibold text-navy-800 mb-4 flex items-center">
                    <Building2 size={20} className="mr-2 text-navy-700" />
                    Organization Information
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-600">
                          GST Number
                        </h3>
                        <p className="text-navy-900 font-medium">
                          {org.gstNumber || "—"}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-600">
                          Address
                        </h3>
                        <p className="text-navy-900 font-medium flex items-start">
                          <MapPin
                            size={16}
                            className="mr-1 mt-1 flex-shrink-0 text-gray-400"
                          />
                          <span>{org.address || "—"}</span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                        <Landmark size={16} className="mr-1 text-navy-700" />
                        Banking Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <h4 className="text-xs text-gray-600">Bank Name</h4>
                          <p className="text-navy-900 font-medium">
                            {org.bankName || "—"}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-xs text-gray-600">
                            Account Number
                          </h4>
                          <p className="text-navy-900 font-medium">
                            {org.accountNumber || "—"}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-xs text-gray-600">IFSC Code</h4>
                          <p className="text-navy-900 font-medium">
                            {org.ifscCode || "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {org.policy && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-600">
                          Policy
                        </h3>
                        <p className="text-navy-900 bg-gray-50 p-3 rounded-lg text-sm">
                          {org.policy}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Other tabs - would be implemented in a full application */}
          <TabsContent value="debit-invoices" className="mt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {org.invoices
                    .filter((I) => I.invoiceType == "DEBIT")
                    .map((invoice: Invoice) => (
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
                        <TableCell>{invoice?.customer.name}</TableCell>
                        <TableCell>{invoice.vehicalNumber ?? "-"}</TableCell>
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
          </TabsContent>

          <TabsContent value="credit-invoices" className="mt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {org.invoices
                    .filter((I) => I.invoiceType == "CREDIT")
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          <div>{formatDate(invoice?.createdAt)}</div>
                          <div className="text-xs text-gray-500">
                            {daysAgo(invoice?.createdAt)} days ago
                          </div>
                        </TableCell>
                        <TableCell>{invoice?.customer?.name}</TableCell>
                        <TableCell>{invoice.vehicalNumber ?? "-"}</TableCell>
                        <TableCell className="text-right">
                          ₹
                          {invoice.grandTotal.toLocaleString("en-IN")}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
