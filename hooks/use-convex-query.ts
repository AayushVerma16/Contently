import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { FunctionReference } from "convex/server";

export const useConvexQuery = <Query extends FunctionReference<"query", "public">>(
  query: Query,
  ...args: Query["_args"] extends Record<string, never>
    ? []
    : [Query["_args"]]
) => {
  const result = useQuery(query, ...(args as any));
  const [data, setData] = useState<Query["_returnType"] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use effect to handle the state changes based on the query result
  useEffect(() => {
    if (result === undefined) {
      setIsLoading(true);
    } else {
      try {
        setData(result);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [result]);

  return {
    data,
    isLoading,
    error,
  };
};

export const useConvexMutation = <Mutation extends FunctionReference<"mutation", "public">>(
  mutation: Mutation
) => {
  const mutationFn = useMutation(mutation);
  const [data, setData] = useState<Mutation["_returnType"] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    ...args: Mutation["_args"] extends Record<string, never>
      ? []
      : [Mutation["_args"]]
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await mutationFn(...(args as any));
      setData(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      toast.error(error.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, data, isLoading, error };
};