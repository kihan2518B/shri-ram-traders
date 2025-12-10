import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  MapPin,
  Clock,
  TrendingUp,
  DollarSign,
  Calendar,
  Filter,
} from "lucide-react";
import { Invoice } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Customer = {
  name: string;
  gstNumber?: string;
  address: string;
  createdAt: string;
  invoices: Invoice[];
};

export const CustomerHeader = ({ customer }: { customer: Customer }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex-grow w-full">
      <div className="flex items-center gap-3 w-full">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 bg-navy-700 text-white">
          <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow overflow-hidden">
          <h1 className="text-xl sm:text-2xl font-bold text-navy-800 flex items-center gap-2 truncate">
            {customer.name}
            {customer.gstNumber && (
              <Badge
                variant="outline"
                className="text-xs ml-2 bg-navy-50 text-navy-700 border-navy-200 hidden sm:inline-flex"
              >
                GST: {customer.gstNumber}
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1 flex items-center truncate">
            <MapPin size={12} className="mr-1 flex-shrink-0" />
            <span className="truncate">{customer.address}</span>
          </p>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
      <Link href={"/dashboard/bills"} className="hidden sm:block">
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white hover:bg-gray-100 text-navy-700 border-gray-300"
        >
          <FileText size={16} />
          <span className="hidden sm:inline">New Invoice</span>
        </Button>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-white hover:bg-gray-100 border-gray-300"
          >
            <span className="sr-only">More options</span>
            <Filter size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="cursor-pointer text-navy-700">
            Edit Customer
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer text-navy-700">
            Export Invoices
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer text-navy-700">
            Payment History
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);

type Analytics = {
  totalBilled: number;
  pendingAmount: number;
  avgInvoiceValue: number;
  latestInvoiceDate: string;
  totalInvoices: number;
  pendingInvoices: number;
};

// Component: AnalyticsCards
export const AnalyticsCards = ({ analytics }: { analytics: Analytics }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
    {[
      {
        title: "Total Billed",
        value: analytics.totalBilled,
        icon: <TrendingUp className="h-4 w-4 text-green-500" />,
        suffix: `Across ${analytics.totalInvoices} invoices`,
      },
      {
        title: "Pending Amount",
        value: analytics.pendingAmount,
        icon: <Clock className="h-4 w-4 text-amber-500" />,
        suffix: `From ${analytics.pendingInvoices} pending invoices`,
      },
      {
        title: "Avg. Invoice Value",
        value: analytics.avgInvoiceValue,
        icon: <DollarSign className="h-4 w-4 text-navy-600" />,
        suffix: "Per transaction",
      },
      {
        title: "Latest Invoice",
        value: analytics.latestInvoiceDate,
        icon: <Calendar className="h-4 w-4 text-navy-600" />,
        suffix: "Last transaction date",
      },
    ].map((card, index) => (
      <Card key={index} className="p-2 sm:p-0">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">
            {card.title}
          </CardTitle>
          {card.icon}
        </CardHeader>
        <CardContent>
          <div className="text-sm sm:text-2xl font-bold text-navy-900 truncate">
            {card.title === "Latest Invoice"
              ? card.value
              : `₹${card.value.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}`}
          </div>
          <p className="text-[10px] sm:text-xs text-gray-600 mt-1 truncate">
            {card.suffix}
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
);
