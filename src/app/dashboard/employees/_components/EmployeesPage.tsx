"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSkeleton } from "@/components/common/Skeletons";
import { useOrganizations } from "@/hooks/useInvoiceFilters";
import {
  Users,
  UserCheck,
  Receipt,
  CalendarCheck,
  Plus,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Phone,
  Building2,
  Calendar,
  CheckCircle2,
  Search,
  Edit2,
} from "lucide-react";
import { AddEmployeeDialog } from "./AddEmployeeDialog";
import { QuickExpenseDialog } from "./QuickExpenseDialog";
import { QuickAttendanceDialog } from "./QuickAttendanceDialog";
import { EditEmployeeDialog } from "./EditEmployeeDialog";

export default function EmployeesPage() {
  const [selectedOrg, setSelectedOrg] = useState("all");
  const [filterWorking, setFilterWorking] = useState<string>("all");
  const [monthYear, setMonthYear] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [isQuickAttendanceOpen, setIsQuickAttendanceOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

  const { data: orgData } = useOrganizations();
  const organizations = orgData?.organizations || [];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["employees", selectedOrg, filterWorking, monthYear],
    queryFn: async () => {
      const res = await axios.get("/api/employees", {
        params: {
          organizationId: selectedOrg,
          isWorking: filterWorking === "all" ? undefined : filterWorking,
          monthYear,
        },
      });
      return res.data;
    },
  });

  const employees = data?.employees || [];
  const summary = data?.summary || {
    totalEmployees: 0,
    activeEmployees: 0,
    totalMonthlyPayable: 0,
    totalMonthlyExpenses: 0,
    totalUnsettledUpad: 0,
  };

  const filteredEmployees = employees.filter((emp: any) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.phone && emp.phone.includes(searchQuery))
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Staff & Salary Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Track daily attendance, manage advances (Upad), and settle month-end payroll
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setIsQuickExpenseOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-9"
            >
              <Receipt className="w-4 h-4 mr-1.5" />
              ⚡ Log Upad / Expense
            </Button>

            <Button
              onClick={() => setIsQuickAttendanceOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9"
            >
              <CalendarCheck className="w-4 h-4 mr-1.5" />
              ⚡ Mark Attendance
            </Button>

            <Button
              onClick={() => setIsAddEmployeeOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-48 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-gray-400" />
              <Input
                placeholder="Search staff name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs bg-white"
              />
            </div>

            {/* Organization Filter */}
            <div className="w-44">
              <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                <SelectTrigger className="w-full h-9 text-xs bg-white">
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

            {/* Status Filter */}
            <div className="w-36">
              <Select value={filterWorking} onValueChange={setFilterWorking}>
                <SelectTrigger className="w-full h-9 text-xs bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="true">Active Only</SelectItem>
                  <SelectItem value="false">Past Employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Month / Year Selector */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-semibold text-gray-600">Month:</span>
            <Input
              type="month"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              className="w-36 h-6 text-xs bg-transparent border-0 shadow-none focus-visible:ring-0 p-0 cursor-pointer font-medium text-gray-800"
            />
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-100 bg-blue-50/40">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-blue-800">
              Active Staff
            </CardTitle>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-950">
              {summary.activeEmployees} / {summary.totalEmployees}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Currently working employees
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-emerald-50/40">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-emerald-800">
              Calculated Payable
            </CardTitle>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-950">
              ₹{summary.totalMonthlyPayable.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              Total attendance wage for {monthYear}
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-amber-50/40">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-amber-800">
              Current Month Upad
            </CardTitle>
            <Receipt className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-950">
              ₹{summary.totalMonthlyExpenses.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-amber-600 mt-1">
              Total draws & advances this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-100 bg-orange-50/40">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-orange-800">
              Rolled Forward Upad
            </CardTitle>
            <ArrowRight className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-950">
              ₹{summary.totalUnsettledUpad.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Unsettled from previous month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employees Grid */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : isError ? (
        <div className="p-6 bg-red-50 text-red-700 rounded-lg">
          Error loading employee records.
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <Users className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No employees found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Get started by adding your first active staff member or logging past employee records.
          </p>
          <Button
            onClick={() => setIsAddEmployeeOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs mt-2"
          >
            <Plus className="w-4 h-4 mr-1" /> Add New Employee
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp: any) => {
            const monthlySalary = parseFloat(emp.monthlySalary) || 0;
            return (
              <div
                key={emp.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/dashboard/employees/${emp.id}`}
                        className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {emp.name}
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        {emp.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" /> {emp.phone}
                          </span>
                        )}
                        {emp.organization && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-gray-400" /> {emp.organization.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        emp.isWorking
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {emp.isWorking ? "Active" : "Past"}
                    </span>
                  </div>

                  {/* Monthly Wage info */}
                  <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 bg-gray-50 rounded-lg text-xs">
                    <div>
                      <span className="text-gray-500 block">Monthly Salary</span>
                      <span className="font-bold text-gray-900">
                        ₹{monthlySalary.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Daily Wage</span>
                      <span className="font-semibold text-blue-700">
                        ₹{emp.dailySalary} / day
                      </span>
                    </div>
                  </div>

                  {/* Month Performance & Upad */}
                  <div className="space-y-1.5 mt-3 pt-3 border-t border-gray-100 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Worked Days:</span>
                      <span className="font-semibold text-gray-900">
                        {emp.totalUnitsWorked} / {emp.daysInMonth} Days
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Attendance Payable:</span>
                      <span className="font-bold text-emerald-700">
                        ₹{emp.calculatedPayable.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-amber-700">
                      <span>Total Upad Drawn:</span>
                      <span className="font-semibold">
                        ₹{emp.totalUpadDrawn.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-dashed border-gray-200">
                      <span className="font-semibold text-gray-800">Net Due:</span>
                      <span
                        className={`font-bold ${
                          emp.netPayable < 0 ? "text-red-600" : "text-purple-700"
                        }`}
                      >
                        {emp.netPayable < 0
                          ? `-₹${Math.abs(emp.netPayable).toLocaleString("en-IN")} (Upad)`
                          : `₹${emp.netPayable.toLocaleString("en-IN")}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingEmployee(emp)}
                      className="h-8 px-2 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      title="Edit Employee"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    {emp.isFinalized && (
                      <span className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Settled
                      </span>
                    )}
                  </div>
                  <Link href={`/dashboard/employees/${emp.id}`}>
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      View Details & Sheet <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      {isAddEmployeeOpen && (
        <AddEmployeeDialog
          isOpen={isAddEmployeeOpen}
          onClose={() => setIsAddEmployeeOpen(false)}
          organizations={organizations}
          defaultOrgId={selectedOrg !== "all" ? selectedOrg : undefined}
        />
      )}

      {isQuickExpenseOpen && (
        <QuickExpenseDialog
          isOpen={isQuickExpenseOpen}
          onClose={() => setIsQuickExpenseOpen(false)}
          employees={employees}
        />
      )}

      {isQuickAttendanceOpen && (
        <QuickAttendanceDialog
          isOpen={isQuickAttendanceOpen}
          onClose={() => setIsQuickAttendanceOpen(false)}
          employees={employees}
        />
      )}

      {editingEmployee && (
        <EditEmployeeDialog
          isOpen={!!editingEmployee}
          onClose={() => setEditingEmployee(null)}
          employee={editingEmployee}
          organizations={organizations}
        />
      )}
    </div>
  );
}

