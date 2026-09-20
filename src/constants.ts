import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  BarChart3,
  Scale,
} from "lucide-react";

export const Menuitems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Bills",
    title: "Invoices",
    url: "/dashboard/bills",
    icon: FileText,
  },
  {
    title: "Organizations",
    url: "/dashboard/organization",
    icon: Building2,
  },
  {
    title: "Customers",
    url: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Balance Sheet",
    url: "/dashboard/balance-sheet",
    icon: Scale,
  },
];
