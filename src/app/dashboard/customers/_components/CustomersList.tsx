// "use client"
// import { User } from '@supabase/supabase-js'
// import { useQuery } from '@tanstack/react-query'
// import React from 'react'
// import axios from "axios"
// import Link from 'next/link'

// const fetchCustomers = async () => {
//     const res = await axios.get("/api/customers")
//     return res.data.customers
// }
// export default function CustomersList({ user }: { user: User }) {
//     const { data: customers } = useQuery({
//         queryKey: ["customers"],
//         queryFn: () => fetchCustomers(),
//         enabled: !!user
//     })

//     return (
//         <div className="mt-8">
//             <h2 className="text-2xl font-semibold mb-4">Existing customers</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {!customers && <div>No customer found...</div>}
//                 {customers && customers.map((cust: any) => (
//                     <Link href={`/dashboard/customers/${cust.id}`} key={cust.id} className="bg-white p-6 rounded-lg shadow">
//                         <h3 className="text-xl font-semibold mb-2">{cust.name}</h3>
//                         <p>GST: {cust.gstNumber}</p>
//                         {/* Add more details as needed */}
//                     </Link>
//                 ))}
//             </div>
//         </div>
//     )
// }


"use client";

import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import axios from "axios";
import Link from "next/link";

// Define customer type for better type safety
interface Customer {
  id: string;
  name: string;
  gstNumber: string;
  address?: string; // Optional, add more fields as needed
}

const fetchCustomers = async (): Promise<Customer[]> => {
  const res = await axios.get("/api/customers");
  return res.data.customers;
};

export default function CustomersList({ user }: { user: User }) {
  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
    enabled: !!user,
  });

  return (
    <div className="mt-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-navy-800 mb-6">
        Existing Customers
      </h2>

      {isLoading ? (
        <div className="text-gray-600 text-center">Loading customers...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {customers?.length === 0 || !customers ? (
            <div className="col-span-full text-gray-600 text-center py-8">
              No customers found...
            </div>
          ) : (
            customers.map((cust: Customer) => (
              <Link
                href={`/dashboard/customers/${cust.id}`}
                key={cust.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-navy-900 mb-2 truncate">
                  {cust.name}
                </h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-navy-700">GST:</span>{" "}
                  {cust.gstNumber}
                </p>
                {cust.address && (
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    <span className="font-medium text-navy-700">Address:</span>{" "}
                    {cust.address}
                  </p>
                )}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}