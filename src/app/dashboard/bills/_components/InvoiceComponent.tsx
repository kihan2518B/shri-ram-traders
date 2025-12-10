'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import InvoicesList from './InvoicesList'
import InvoiceForm from './InvoiceForm'

async function GetInvoices() {
  const res = await axios.get('/api/invoices')
  return res.data.invoices
}

export default function InvoicesComponent({ user }: { user: any }) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([])
  const [organizationOptions, setOrganizationOptions] = useState<string[]>([])
  const [filters, setFilters] = useState({
    organization: '',
    invoiceType: '',
    status: '',
  })
  const [currentPage, setCurrentPage] = useState(1)

  const {
    data: rawInvoices,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: GetInvoices,
    enabled: !!user,
  })

  return (
    <div className="p-6 w-screen">
      <h1 className="text-3xl font-bold mb-6">Invoices</h1>
      <InvoicesList
        rawInvoices={rawInvoices}
        refetch={refetch}
        isLoading={isLoading}
        invoices={invoices}
        setInvoices={setInvoices}
        filteredInvoices={filteredInvoices}
        setFilteredInvoices={setFilteredInvoices}
        organizationOptions={organizationOptions}
        setOrganizationOptions={setOrganizationOptions}
        filters={filters}
        setFilters={setFilters}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={5}
      />
      <InvoiceForm user={user} refetch={refetch} />
    </div>
  )
}
