// app/dashboard/backup/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import * as XLSX from "xlsx";

export default function BackupPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportBackup = async () => {
    setIsExporting(true);
    const toastId = toast.loading("Generating full database backup...");

    try {
      // 1. Fetch all tables data
      const response = await axios.post("/api/backup/full", {
        timeout: 60000, // 60 seconds timeout (large datasets)
      });

      const allData = response.data;

      if (!allData || Object.keys(allData).length === 0) {
        throw new Error("No data received from server");
      }

      // 2. Create workbook
      const wb = XLSX.utils.book_new();

      // 3. Add one sheet per table
      Object.entries(allData).forEach(([tableName, rows]: [string, any[]]) => {
        if (!Array.isArray(rows) || rows.length === 0) {
          // Empty table → add placeholder row
          const ws = XLSX.utils.aoa_to_sheet([
            ["No records found in this table"],
          ]);
          XLSX.utils.book_append_sheet(wb, ws, tableName.slice(0, 31)); // Excel sheet name limit ~31 chars
          return;
        }

        // Convert array of objects → worksheet
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, tableName.slice(0, 31));
      });

      // 4. Generate filename with date
      const today = new Date().toISOString().split("T")[0];
      const fileName = `full-backup-${today}.xlsx`;

      // 5. Download
      XLSX.writeFile(wb, fileName);

      toast.success(`Backup downloaded: ${fileName}`, { id: toastId });
    } catch (err: any) {
      console.error("Backup export failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to create backup. Try again.",
        { id: toastId },
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">Database Backup</h1>
      <p className="text-muted-foreground mb-8">
        Export all tables as separate sheets in one Excel file.
      </p>

      <div className="bg-card border rounded-lg p-8 text-center">
        <div className="mb-6">
          <p className="text-lg font-medium mb-2">
            This will download a complete snapshot of your database.
          </p>
          <p className="text-sm text-muted-foreground">
            File format: .xlsx (one sheet per table)
          </p>
        </div>

        <Button
          size="lg"
          onClick={handleExportBackup}
          disabled={isExporting}
          className="gap-2 min-w-[240px]"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Download Full Backup
            </>
          )}
        </Button>

        <p className="mt-6 text-xs text-muted-foreground">
          Depending on database size, this may take 10–60 seconds.
        </p>
      </div>
    </div>
  );
}
