"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Calendar, Edit3 } from "lucide-react";

interface AttendanceRecord {
  id?: string;
  date: string;
  status: "FULL_DAY" | "THREE_QUARTER" | "HALF_DAY" | "QUARTER_DAY" | "ABSENT";
  units: number;
  note?: string;
}

interface AttendanceCalendarProps {
  employeeId: string;
  employeeName: string;
  monthYear: string; // "YYYY-MM"
  onMonthChange: (newMonth: string) => void;
  attendances: AttendanceRecord[];
}

const ATTENDANCE_MODES = [
  { value: "FULL_DAY", label: "Full Day", factor: "100%", units: 1.0, badge: "bg-emerald-500 text-white", border: "border-emerald-300" },
  { value: "THREE_QUARTER", label: "3/4 Day", factor: "75%", units: 0.75, badge: "bg-sky-500 text-white", border: "border-sky-300" },
  { value: "HALF_DAY", label: "Half Day", factor: "50%", units: 0.5, badge: "bg-amber-500 text-white", border: "border-amber-300" },
  { value: "QUARTER_DAY", label: "1/4 Day", factor: "25%", units: 0.25, badge: "bg-orange-500 text-white", border: "border-orange-300" },
  { value: "ABSENT", label: "Absent / Leave", factor: "0%", units: 0.0, badge: "bg-red-500 text-white", border: "border-red-300" },
];

export function AttendanceCalendar({
  employeeId,
  employeeName,
  monthYear,
  onMonthChange,
  attendances,
}: AttendanceCalendarProps) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("FULL_DAY");
  const [selectedNote, setSelectedNote] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [yearStr, monthStr] = monthYear.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayWeekday = new Date(year, month - 1, 1).getDay(); // 0 is Sunday

  // Map attendances by YYYY-MM-DD
  const attendanceMap: Record<string, AttendanceRecord> = {};
  attendances.forEach((att) => {
    const key = new Date(att.date).toISOString().split("T")[0];
    attendanceMap[key] = att;
  });

  const handlePrevMonth = () => {
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const formattedMonth = prevMonth < 10 ? `0${prevMonth}` : `${prevMonth}`;
    onMonthChange(`${prevYear}-${formattedMonth}`);
  };

  const handleNextMonth = () => {
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    const formattedMonth = nextMonth < 10 ? `0${nextMonth}` : `${nextMonth}`;
    onMonthChange(`${nextYear}-${formattedMonth}`);
  };

  const handleCellClick = (day: number) => {
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const dateKey = `${monthYear}-${formattedDay}`;
    const existing = attendanceMap[dateKey];

    setSelectedDate(dateKey);
    setSelectedStatus(existing ? existing.status : "FULL_DAY");
    setSelectedNote(existing?.note || "");
  };

  const handleSaveAttendance = async () => {
    if (!selectedDate) return;
    setIsUpdating(true);
    try {
      await axios.post("/api/attendance", {
        employeeId,
        date: selectedDate,
        status: selectedStatus,
        note: selectedNote,
      });

      toast.success("Attendance updated!");
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setSelectedDate(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update attendance");
    } finally {
      setIsUpdating(false);
    }
  };

  const monthLabel = new Date(year, month - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm space-y-4">
      {/* Month Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">{monthLabel} Attendance</h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="h-8 px-2.5 text-xs text-gray-600"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev Month
          </Button>
          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-md">
            {monthLabel}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="h-8 px-2.5 text-xs text-gray-600"
          >
            Next Month <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-gray-500 mb-1">
            {weekDays.map((d, i) => (
              <div key={d} className={`py-1 ${i === 0 ? "text-red-500 font-bold" : ""}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty slots for starting weekday */}
            {Array.from({ length: firstDayWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 bg-gray-50/50 rounded-lg border border-dashed border-gray-100" />
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const formattedDay = day < 10 ? `0${day}` : `${day}`;
              const dateKey = `${monthYear}-${formattedDay}`;
              const att = attendanceMap[dateKey];
              const mode = att ? ATTENDANCE_MODES.find((m) => m.value === att.status) : null;
              const isSunday = (firstDayWeekday + i) % 7 === 0;

              return (
                <div
                  key={day}
                  onClick={() => handleCellClick(day)}
                  className={`h-16 p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md hover:border-blue-400 ${
                    att
                      ? `${mode?.border} bg-white shadow-xs`
                      : isSunday
                      ? "bg-slate-50 border-gray-200"
                      : "bg-white border-gray-200 hover:bg-blue-50/30"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-xs font-bold ${
                        isSunday ? "text-red-500" : "text-gray-800"
                      }`}
                    >
                      {day}
                    </span>
                    <Edit3 className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-blue-500" />
                  </div>

                  {att ? (
                    <div className="space-y-0.5">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block ${mode?.badge}`}
                      >
                        {mode?.label} ({mode?.factor})
                      </span>
                      {att.note && (
                        <p className="text-[9px] text-gray-500 truncate" title={att.note}>
                          {att.note}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-400 italic">Unmarked</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <span className="font-semibold text-gray-700">Legend:</span>
        {ATTENDANCE_MODES.map((m) => (
          <div key={m.value} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${m.badge}`} />
            <span>
              {m.label} ({m.factor})
            </span>
          </div>
        ))}
      </div>

      {/* Edit Single Day Attendance Dialog */}
      {selectedDate && (
        <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
          <DialogContent className="max-w-sm w-full">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                Update Attendance for {selectedDate}
              </DialogTitle>
              <p className="text-xs text-gray-500">
                Employee: <strong className="text-gray-800">{employeeName}</strong>
              </p>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <Label className="text-xs font-semibold text-gray-700">Select Status</Label>
              <div className="grid grid-cols-2 gap-2">
                {ATTENDANCE_MODES.map((m) => {
                  const isSelected = selectedStatus === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setSelectedStatus(m.value)}
                      className={`p-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500 shadow-sm"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {m.label} ({m.factor})
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Note (Optional)</Label>
                <Input
                  placeholder="e.g. Left early at 3 PM / Overtime"
                  value={selectedNote}
                  onChange={(e) => setSelectedNote(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveAttendance}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUpdating ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

