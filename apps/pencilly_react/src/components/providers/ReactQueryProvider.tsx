import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: (failureCount, error) => {
          if (
            isAxiosError(error) &&
            (error?.status === 404 || error?.status === 401)
          ) {
            return false;
          }
          return failureCount < 5;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function ReactQueryProvider({ children }: PropsWithChildren) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/* force font size for react query dev tools: https://github.com/TanStack/query/issues/6666 */}
      {/*<div style={{ fontSize: "16px" }}>/!* <ReactQueryDevtools /> *!/</div>*/}
    </QueryClientProvider>
  );
}
