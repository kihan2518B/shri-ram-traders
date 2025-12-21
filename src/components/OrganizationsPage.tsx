// "use client"
// import Link from 'next/link'
// import Image from 'next/image'
// import { Building2, FileSpreadsheet } from 'lucide-react'

// import axios from 'axios'
// import { useQuery } from '@tanstack/react-query'
// import OrganizationForm from '@/app/dashboard/organization/_components/OrganizationForm'
// import { Organization } from '../../generated/prisma'

// const fetchOrg = async () => {
//     const res = await axios.get("/api/organizations")
//     return res.data.organizations
// }

// export default function OrganizationPage() {
//     const { data: organizations } = useQuery({
//         queryKey: ['organizations'],
//         queryFn: () => fetchOrg(),
//     })
//     return (
//         <div className="container mx-auto px-4 py-8 space-y-8">
//             <div className="flex flex-col md:flex-row justify-between items-center">
//                 <h1 className="text-3xl font-bold text-navy-800 mb-4 md:mb-0">
//                     Organizations
//                 </h1>
//             </div>
//             <OrganizationForm />

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {organizations && organizations.map((org:Organization) => (
//                     <Link
//                         href={`/dashboard/organization/${org.id}`}
//                         key={org.id}
//                         className="
//                             bg-white 
//                             rounded-lg 
//                             shadow-md 
//                             hover:shadow-lg 
//                             transition-shadow 
//                             duration-300 
//                             border 
//                             border-gray-200 
//                             overflow-hidden 
//                             group"
//                     >
//                         <div className="relative w-full h-48 bg-gray-100">
//                             {org.logo ? (
//                                 <Image
//                                     src={org.logo}
//                                     alt={`${org.name} Logo`}
//                                     fill
//                                     className="object-contain p-4"
//                                 />
//                             ) : (
//                                 <div className="flex items-center justify-center h-full text-gray-400">
//                                     <Building2 className="w-16 h-16" />
//                                 </div>
//                             )}
//                         </div>
//                         <div className="p-6">
//                             <h3 className="text-xl font-semibold text-navy-900 mb-2 group-hover:text-navy-700 transition-colors">
//                                 {org.name}
//                             </h3>
//                             <div className="space-y-2 text-gray-600">
//                                 <p className="flex items-center gap-2">
//                                     <FileSpreadsheet className="w-4 h-4" />
//                                     GST: {org.gstNumber}
//                                 </p>
//                                 <p>Bank: {org.bankName}</p>
//                             </div>
//                         </div>
//                     </Link>
//                 ))}
//             </div>
//         </div>
//     )
// }
"use client"
import Link from 'next/link'
import Image from 'next/image'
import { Building2, FileSpreadsheet, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import OrganizationForm from '@/app/dashboard/organization/_components/OrganizationForm'
import { Organization } from '../../generated/prisma'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

const fetchOrg = async () => {
  const res = await axios.get("/api/organizations")
  return res.data.organizations
}

// Skeleton component for loading state
function OrganizationCardSkeleton() {
  return (
    <div className="bg-white w-full rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

// Empty state component
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <Building2 className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No organizations yet
      </h3>
      <p className="text-gray-600 text-center max-w-md">
        Get started by creating your first organization using the form above.
      </p>
    </div>
  )
}

export default function OrganizationPage() {
  const { data: organizations, isLoading, isError, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => fetchOrg(),
  })

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 w-screen h-full">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-navy-800 mb-4 md:mb-0">
          Organizations
        </h1>
      </div>

      <OrganizationForm />

      {/* Error state */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load organizations. {error instanceof Error ? error.message : 'Please try again later.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {[...Array(6)].map((_, i) => (
            <OrganizationCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && organizations?.length === 0 && (
        <div className="grid grid-cols-1">
          <EmptyState />
        </div>
      )}

      {/* Organizations grid */}
      {!isLoading && !isError && organizations && organizations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org: Organization) => (
            <Link
              href={`/dashboard/organization/${org.id}`}
              key={org.id}
              className="
                bg-white 
                rounded-lg 
                shadow-md 
                hover:shadow-lg 
                transition-all
                duration-300 
                border 
                border-gray-200 
                hover:border-navy-300
                overflow-hidden 
                group
                hover:-translate-y-1
              "
            >
              <div className="relative w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                {org.logo ? (
                  <Image
                    src={org.logo}
                    alt={`${org.name} Logo`}
                    fill
                    className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <Building2 className="w-16 h-16 transition-colors group-hover:text-navy-500" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-navy-900 mb-3 group-hover:text-navy-700 transition-colors line-clamp-1">
                  {org.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">GST: {org.gstNumber}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Bank: {org.bankName}</span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}