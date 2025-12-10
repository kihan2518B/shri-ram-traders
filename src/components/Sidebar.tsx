"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/organizations", label: "Organizations" },
  { href: "/dashboard/invoices", label: "Invoices" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/payments", label: "Payments" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="w-64 bg-white shadow-md">
      <div className="p-4">
        <h2 className="text-xl font-semibold">Shri Ram Traders</h2>
      </div>
      <ul className="space-y-2 py-4">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`block px-4 py-2 text-sm ${
                pathname === item.href ? "bg-indigo-500 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

