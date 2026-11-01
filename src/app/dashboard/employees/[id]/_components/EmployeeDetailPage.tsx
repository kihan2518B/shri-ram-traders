"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import {
  User,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  Receipt,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Edit2,
  Trash2,
  PlusCircle,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import { TableSkeleton } from "@/components/common/Skeletons";
import { AttendanceCalendar } from "./AttendanceCalendar";
import { PayableJustificationDialog } from "./PayableJustificationDialog";
import { ExpensesListDialog } from "./ExpensesListDialog";
import { SalarySettlementDialog } from "./SalarySettlementDialog";
import { QuickExpenseDialog } from "../../_components/QuickExpenseDialog";
import { EditEmployeeDialog } from "../../_components/EditEmployeeDialog";
import { useOrganizations } from "@/hooks/useInvoiceFilters";

export default function EmployeeDetailPage({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [monthYear, setMonthYear] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // Modal states
  const [isPayableDialogOpen, setIsPayableDialogOpen] = useState(false);
  const [isExpensesDialogOpen, setIsExpensesDialogOpen] = useState(false);
  const [isSettlementDialogOpen, setIsSettlementDialogOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: orgData } = useOrganizations();
  const organizations = orgData?.organizations || [];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["employee", employeeId, monthYear],
    queryFn: async () => {
      const res = await axios.get(`/api/employees/${employeeId}`, {
        params: { monthYear },
      });
      return res.data;
    },
  });

  const employee = data?.employee;
  const attendances = data?.attendances || [];
  const expenses = data?.expenses || [];
  const salarySlips = data?.salarySlips || [];

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete employee "${employee?.name}"? All associated attendance and records will be deleted.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await axios.delete(`/api/employees/${employeeId}`);
      toast.success("Employee deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      router.push("/dashboard/employees");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete employee");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-4">
        <TableSkeleton rows={8} />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="p-6 bg-red-50 text-red-700 rounded-lg">
          Employee record not found.
          <Button
            variant="outline"
            className="mt-3 block"
            onClick={() => router.push("/dashboard/employees")}
          >
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  const monthlySalary = parseFloat(employee.monthlySalary) || 0;
  const calculatedPayable = employee.calculatedPayable || 0;
  const previousMonthUpad = employee.previousMonthUpad || 0;
  const currentMonthExpenses = employee.currentMonthExpenses || 0;
  const totalUpadDrawn = employee.totalUpadDrawn || 0;
  const netPayable = employee.netPayable || 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/employees")}
              className="text-gray-500 hover:text-gray-900 mt-1"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    employee.isWorking
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {employee.isWorking ? "Active Staff" : "Past Employee"}
                </span>
                {employee.currentSlip && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Month Settled
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1.5 flex-wrap">
                {employee.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {employee.phone}
                  </span>
                )}
                {employee.organization && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" /> {employee.organization.name}
                  </span>
                )}
                {employee.joiningDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> Joined:{" "}
                    {new Date(employee.joiningDate).toLocaleDateString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Month Selector & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
              <span className="text-xs font-semibold text-gray-600">Period:</span>
              <Input
                type="month"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                className="w-36 h-7 text-xs bg-white border-0 shadow-none focus-visible:ring-0 p-0 cursor-pointer"
              />
            </div>

            <Button
              size="sm"
              onClick={() => setIsExpenseModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1" /> Log Upad / Expense
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="text-gray-700 hover:bg-gray-50 text-xs h-8"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1 text-gray-500" /> Edit Details
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:bg-red-50 text-xs h-8"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Clickable KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Attendance Calculated Payable */}
        <Card
          onClick={() => setIsPayableDialogOpen(true)}
          className="cursor-pointer border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50/70 hover:shadow-md transition-all group"
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-emerald-800">
              Attendance Payable
            </CardTitle>
            <HelpCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-950">
              ₹{calculatedPayable.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
              <span>{employee.totalUnitsWorked} days worked</span>
              <span className="text-emerald-500">• Click to view breakdown</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Current Month Expenses / Advances */}
        <Card
          onClick={() => setIsExpensesDialogOpen(true)}
          className="cursor-pointer border-amber-100 bg-amber-50/40 hover:bg-amber-50/70 hover:shadow-md transition-all group"
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-amber-800">
              Current Month Upad / Expenses
            </CardTitle>
            <Receipt className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-950">
              ₹{currentMonthExpenses.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
              <span>{expenses.length} entries</span>
              <span className="text-amber-500">• Click to view all</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Previous Month Unsettled Upad */}
        <Card className="border-orange-100 bg-orange-50/40">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-orange-800">
              Previous Month Upad
            </CardTitle>
            <ArrowRight className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-950">
              ₹{previousMonthUpad.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-orange-700 mt-1">
              Unsettled rollover from last month
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Net Balance Position */}
        <Card className={`border-purple-100 ${netPayable < 0 ? "bg-red-50/40" : "bg-purple-50/40"}`}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-purple-800">
              {netPayable >= 0 ? "Net Payable to Employee" : "Excess Upad Owed by Staff"}
            </CardTitle>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netPayable < 0 ? "text-red-700" : "text-purple-950"}`}>
              {netPayable < 0
                ? `-₹${Math.abs(netPayable).toLocaleString("en-IN")}`
                : `₹${netPayable.toLocaleString("en-IN")}`}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Payable ₹{calculatedPayable} - Upad ₹{totalUpadDrawn}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="attendance" className="w-full space-y-4">
        <TabsList className="bg-white border border-gray-200 p-1 rounded-xl">
          <TabsTrigger value="attendance" className="text-xs sm:text-sm">
            Attendance Calendar
          </TabsTrigger>
          <TabsTrigger value="expenses" className="text-xs sm:text-sm">
            Expenses & Upad History ({expenses.length})
          </TabsTrigger>
          <TabsTrigger value="settlement" className="text-xs sm:text-sm">
            Month Settlement & Slips
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Attendance */}
        <TabsContent value="attendance">
          <AttendanceCalendar
            employeeId={employee.id}
            employeeName={employee.name}
            monthYear={monthYear}
            onMonthChange={setMonthYear}
            attendances={attendances}
          />
        </TabsContent>

        {/* Tab 2: Expenses & Upad History */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">
                  Expenses & Salary Advances for {monthYear}
                </CardTitle>
                <p className="text-xs text-gray-500">
                  All draws deducted from monthly salary
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsExpenseModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Expense
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-gray-400 text-xs">
                          No expenses or advances logged for this employee in {monthYear}.
                        </TableCell>
                      </TableRow>
                    ) : (
                      expenses.map((exp: any) => (
                        <TableRow key={exp.id} className="text-xs">
                          <TableCell className="font-medium text-gray-900">
                            {new Date(exp.expenseDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-800">
                              {exp.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-700">{exp.description}</TableCell>
                          <TableCell className="text-right font-bold text-amber-700">
                            ₹{parseFloat(exp.amount).toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Settlement */}
        <TabsContent value="settlement" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">
                  Month-End Settlement for {monthYear}
                </CardTitle>
                <p className="text-xs text-gray-500">
                  {employee.currentSlip
                    ? "Settlement has already been finalized for this month."
                    : "Review attendance and decide final salary to settle this month."}
                </p>
              </div>
              <Button
                onClick={() => setIsSettlementDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                {employee.currentSlip ? "Update Settlement" : "Finalize Month Settlement"}
              </Button>
            </CardHeader>
            <CardContent>
              {employee.currentSlip ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-purple-50/60 rounded-xl border border-purple-200 text-xs">
                  <div>
                    <span className="text-gray-500 block">Decided Salary</span>
                    <span className="text-base font-bold text-purple-900">
                      ₹{parseFloat(employee.currentSlip.decidedSalary).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Payout Given at Settlement</span>
                    <span className="text-base font-bold text-blue-900">
                      ₹{parseFloat(employee.currentSlip.payoutAmount).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Total Draws (Upad + Expenses)</span>
                    <span className="text-base font-bold text-amber-900">
                      ₹{parseFloat(employee.currentSlip.currentMonthExpenses).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Unsettled Upad (Rolled Forward)</span>
                    <span className="text-base font-bold text-red-700">
                      ₹{parseFloat(employee.currentSlip.unsettledUpad).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {employee.currentSlip.notes && (
                    <div className="col-span-full pt-2 border-t border-purple-200">
                      <span className="font-semibold text-gray-700">Notes: </span>
                      <span className="text-gray-600">{employee.currentSlip.notes}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-xs bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <p>Settlement not finalized yet for {monthYear}.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 text-purple-700 border-purple-200 hover:bg-purple-50"
                    onClick={() => setIsSettlementDialogOpen(true)}
                  >
                    Open Settlement Dialog
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Salary Slips History Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-gray-900">
                Past Salary Slips & Settlement History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Days Worked</TableHead>
                      <TableHead className="text-right">Decided Salary</TableHead>
                      <TableHead className="text-right">Payout Given</TableHead>
                      <TableHead className="text-right">Unsettled Upad</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salarySlips.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-400 text-xs">
                          No finalized salary slips recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      salarySlips.map((slip: any) => (
                        <TableRow key={slip.id} className="text-xs">
                          <TableCell className="font-bold text-gray-900">
                            {slip.monthYear}
                          </TableCell>
                          <TableCell>{slip.totalUnitsWorked} days</TableCell>
                          <TableCell className="text-right font-semibold text-purple-900">
                            ₹{parseFloat(slip.decidedSalary).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right font-medium text-blue-700">
                            ₹{parseFloat(slip.payoutAmount).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right font-bold text-amber-700">
                            ₹{parseFloat(slip.unsettledUpad).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-0.5 rounded-full font-bold bg-green-100 text-green-800 text-[11px]">
                              {slip.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Drilldown Dialogs */}
      {isPayableDialogOpen && (
        <PayableJustificationDialog
          isOpen={isPayableDialogOpen}
          onClose={() => setIsPayableDialogOpen(false)}
          employeeName={employee.name}
          monthlySalary={monthlySalary}
          daysInMonth={employee.daysInMonth}
          dailySalary={employee.dailySalary}
          totalUnitsWorked={employee.totalUnitsWorked}
          calculatedPayable={calculatedPayable}
          attendances={attendances}
        />
      )}

      {isExpensesDialogOpen && (
        <ExpensesListDialog
          isOpen={isExpensesDialogOpen}
          onClose={() => setIsExpensesDialogOpen(false)}
          employeeName={employee.name}
          monthYear={monthYear}
          expenses={expenses}
          totalExpenses={currentMonthExpenses}
        />
      )}

      {isSettlementDialogOpen && (
        <SalarySettlementDialog
          isOpen={isSettlementDialogOpen}
          onClose={() => setIsSettlementDialogOpen(false)}
          employeeId={employee.id}
          employeeName={employee.name}
          monthYear={monthYear}
          monthlySalary={monthlySalary}
          calculatedPayable={calculatedPayable}
          previousMonthUpad={previousMonthUpad}
          currentMonthExpenses={currentMonthExpenses}
          existingSlip={employee.currentSlip}
        />
      )}

      {isExpenseModalOpen && (
        <QuickExpenseDialog
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          employees={[{ id: employee.id, name: employee.name }]}
          defaultEmployeeId={employee.id}
          defaultType="Salary"
        />
      )}

      {isEditDialogOpen && (
        <EditEmployeeDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          employee={employee}
          organizations={organizations}
        />
      )}
    </div>
  );
}

