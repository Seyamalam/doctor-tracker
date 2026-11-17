import {
  environmentManager,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

const makeQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        toast.error(error.message, {
          action: {
            label: "retry",
            onClick: () => {
              query.invalidate();
            },
          },
        });
      },
    }),
  });

let browserQueryClient: QueryClient | undefined;

export const getQueryClient = () => {
  if (environmentManager.isServer()) {
    return makeQueryClient();
  }

  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
};
