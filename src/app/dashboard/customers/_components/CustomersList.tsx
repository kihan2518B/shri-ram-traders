"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { DeleteCustomerDialog } from "@/components/common/DeleteCustomerDialog";
import { EditCustomerDialog } from "@/components/common/EditCustomerDialog";
import { CardSkeleton } from "@/components/common/Skeletons";

interface Customer {
  id: string;
  name: string;
  gstNumber: string;
  address?: string;
}

const fetchCustomers = async (): Promise<Customer[]> => {
  const res = await axios.get("/api/customers");
  return res.data.customers;
};

export default function CustomersList({ user }: { user: string }) {
  const queryClient = useQueryClient();
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(
    null,
  );
  const [linkedInfo, setLinkedInfo] = useState({
    invoicesCount: 0,
    paymentsCount: 0,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
    enabled: !!user,
  });

  const handleEditClick = (e: React.MouseEvent, cust: Customer) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCustomer(cust);
  };

  const handleDeleteClick = async (e: React.MouseEvent, cust: Customer) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await axios.get(`/api/customers/${cust.id}/check-linked`);
      setLinkedInfo({
        invoicesCount: res.data.invoicesCount,
        paymentsCount: res.data.paymentsCount,
      });
      setDeletingCustomer(cust);
    } catch (err) {
      toast.error("Failed to check customer linked records");
    }
  };

  const confirmDelete = async () => {
    if (!deletingCustomer) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/customers/${deletingCustomer.id}`);
      toast.success(`Customer ${deletingCustomer.name} deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["balance-sheet"] });
      setDeletingCustomer(null);
    } catch (err) {
      toast.error("Failed to delete customer");
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmUpdate = async (updatedData: {
    name: string;
    gstNumber: string;
    address: string;
  }) => {
    if (!editingCustomer) return;
    setIsUpdating(true);
    try {
      await axios.put(`/api/customers/${editingCustomer.id}`, updatedData);
      toast.success("Customer details updated successfully");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setEditingCustomer(null);
    } catch (err) {
      toast.error("Failed to update customer details");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mt-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-navy-800 mb-6">
        Existing Customers
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {customers?.length === 0 || !customers ? (
          {!Array.isArray(customers) || customers.length === 0 ? (
            <div className="col-span-full text-gray-600 text-center py-8">
              No customers found...
            </div>
          ) : (
            customers.map((cust: Customer) => (
              <div
                key={cust.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <Link
                      href={`/dashboard/customers/${cust.id}`}
                      className="text-lg font-semibold text-navy-900 hover:text-blue-600 truncate block"
                    >
                      {cust.name}
                    </Link>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-blue-600"
                        onClick={(e) => handleEditClick(e, cust)}
                        title="Edit Customer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600"
                        onClick={(e) => handleDeleteClick(e, cust)}
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-navy-700">GST:</span>{" "}
                    {cust.gstNumber || "N/A"}
                  </p>
                  {cust.address && (
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      <span className="font-medium text-navy-700">
                        Address:
                      </span>{" "}
                      {cust.address}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                  <Link href={`/dashboard/customers/${cust.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCustomer && (
        <DeleteCustomerDialog
          isOpen={!!deletingCustomer}
          onClose={() => setDeletingCustomer(null)}
          onConfirm={confirmDelete}
          customerName={deletingCustomer.name}
          linkedInfo={linkedInfo}
          isLoading={isDeleting}
        />
      )}

      {/* Edit Customer Dialog */}
      {editingCustomer && (
        <EditCustomerDialog
          isOpen={!!editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSave={confirmUpdate}
          customer={editingCustomer}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
}
