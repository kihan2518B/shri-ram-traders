"use client";

import { useState } from "react";
import { Organization } from "@prisma/client";
import EditOrganizationDialog from "./EditOrganizationDialog";
import { Edit, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function OrganizationHeader({ org }: { org: Organization }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-800 flex items-center">
          {org.name}
          {org.gstNumber && (
            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              GST: {org.gstNumber}
            </span>
          )}
        </h1>
        <p className="text-gray-600 text-sm mt-1 line-clamp-1">{org.address}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => setIsDialogOpen(true)}
          variant="outline"
          className="flex items-center gap-2 bg-white hover:bg-gray-100 text-navy-700 border-gray-300"
        >
          <Edit size={16} />
          <span className="hidden sm:inline">Edit Organization</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-white hover:bg-gray-100 border-gray-300">
              <span className="sr-only">More options</span>
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="cursor-pointer text-navy-700">
              View Invoices
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-navy-700">
              Customer Management
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-navy-700">
              Export Data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isDialogOpen && (
        <EditOrganizationDialog org={org} onClose={() => setIsDialogOpen(false)} />
      )}
    </div>
  );
}