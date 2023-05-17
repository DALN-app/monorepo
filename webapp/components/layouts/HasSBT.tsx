import { Center, CircularProgress } from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { useMemo } from "react";
import { useAccount, useConnect } from "wagmi";

import OverlayOnboarding from "../OverlayOnboarding";

import PageTransition from "~~/components/PageTransition";
import { useBasicFevmDalnBalanceOf } from "~~/generated/wagmiTypes";

interface HasSBTProps {
  children: React.ReactNode;
}

const HasSBT = ({ children }: HasSBTProps) => {
  const { address } = useAccount();
  const { isLoading } = useConnect();
  const balanceQuery = useBasicFevmDalnBalanceOf({
    address: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`,
    args: [address || "0x0"],
    enabled: !!address,
  });

  const loader = useMemo(() => {
    return (
      <Center h="100vh">
        <CircularProgress isIndeterminate />
      </Center>
    );
  }, []);

  return (
    <PageTransition>
      {!isLoading && address && !balanceQuery.isFetched ? (
        loader
      ) : (
        <>
          {balanceQuery.data?.lte(BigNumber.from(0)) && <OverlayOnboarding />}
          {children}
        </>
      )}
    </PageTransition>
  );
};

export default HasSBT;
