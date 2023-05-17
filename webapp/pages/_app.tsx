import "@rainbow-me/rainbowkit/styles.css";
import { ChakraProvider, Flex } from "@chakra-ui/react";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { WagmiConfig, configureChains, createClient } from "wagmi";
import { filecoinHyperspace } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import theme from "~~/styles/theme";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const queryClient = new QueryClient();

const { chains, provider, webSocketProvider } = configureChains(
  [filecoinHyperspace],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "DALN Fevm Testnet",
  projectId: "905f52d1482f91dab820a9be21b2ce58",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <ChakraProvider theme={theme}>
          <AnimatePresence mode="wait" initial={false}>
            <QueryClientProvider client={queryClient}>
              <Flex minH="100vh" direction="column" w="full" bg="#F1F4F9">
                {getLayout(<Component {...pageProps} />)}
              </Flex>
            </QueryClientProvider>
          </AnimatePresence>
        </ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
