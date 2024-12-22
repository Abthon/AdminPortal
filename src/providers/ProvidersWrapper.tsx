import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { AuthProvider } from "@/auth/providers/JWTProvider";
import {
  LayoutProvider,
  LoadersProvider,
  MenusProvider,
  SettingsProvider,
  TranslationProvider,
} from "@/providers";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
    },
  },
});

const ProvidersWrapper = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      <AuthProvider>
        <SettingsProvider>
          <TranslationProvider>
            <HelmetProvider>
              <LayoutProvider>
                <LoadersProvider>
                  <MenusProvider>{children}</MenusProvider>
                </LoadersProvider>
              </LayoutProvider>
            </HelmetProvider>
          </TranslationProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export { ProvidersWrapper };
