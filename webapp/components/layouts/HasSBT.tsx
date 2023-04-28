import { Center, CircularProgress } from "@chakra-ui/react";
import { useAccountModal } from "@rainbow-me/rainbowkit";
import { BigNumber } from "ethers";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import PageTransition from "~~/components/PageTransition";
import { useBasicFevmDalnBalanceOf } from "~~/generated/wagmiTypes";

interface HasSBTProps {
  children: React.ReactNode;
}

const HasSBT = ({ children }: HasSBTProps) => {
  const { openAccountModal } = useAccountModal();
  const { address } = useAccount();
  const router = useRouter();

  const [shouldLoad, setShouldLoad] = useState(true);

  const balanceQuery = useBasicFevmDalnBalanceOf({
    address: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`,
    args: [address || "0x0"],
    enabled: !!address,
  });

  useEffect(() => {
    if (address && balanceQuery.isSuccess) {
      setShouldLoad(false);
    }
  }, [address, balanceQuery.isSuccess]);

  useEffect(() => {
    if (router.isReady) {
      if (address && balanceQuery.isSuccess) {
        if (balanceQuery.data?.lte(BigNumber.from(0))) {
          void router.replace("/user/onboarding/no-token");
        }
      }
    }
  }, [address, balanceQuery.data, balanceQuery.isSuccess, router]);

  return (
    <>
      <PageTransition>
        {address && shouldLoad ? (
          <Center h="100vh">
            <CircularProgress isIndeterminate />
          </Center>
        ) : (
          children
        )}
      </PageTransition>
    </>
  );
};

export default HasSBT;
