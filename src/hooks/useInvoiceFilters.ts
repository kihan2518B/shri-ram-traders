import { useQuery } from "@tanstack/react-query";

export const useOrganizations = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await fetch("/api/organizations");
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    },
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
  console.log("data: ", data);
  return { data, isLoading, isError };
};

export const useCustomers = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await fetch("/api/customers");
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    },
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
  // console.log("data: ", data);

  return { data, isLoading, isError };
};
