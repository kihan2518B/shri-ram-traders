import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchInvoices = async ({ pageParam = 1 }: { pageParam?: number }) => {
  const res = await axios.get("/api/invoices", {
    params: { page: pageParam, limit: 10 },
  });
  return res.data;
};

export const useInvoices = (user: any) => {
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
  
  return {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
