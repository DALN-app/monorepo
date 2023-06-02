import { Center, CircularProgress } from "@chakra-ui/react";
import axios from "axios";
import { useMemo } from "react";
import { useAccount, useConnect, useQuery } from "wagmi";

import OverlayOnboarding from "../OverlayOnboarding";

import PageTransition from "~~/components/PageTransition";
import { OnboardingSteps } from "~~/types/onboarding";

interface HasSBTProps {
  children: React.ReactNode;
}

const HasSBT = ({ children }: HasSBTProps) => {
  const { address } = useAccount();
  const { isLoading } = useConnect();
  const { data: stepData, isFetchedAfterMount: isStepFetchedAfterMount } =
    useQuery(
      ["get_onboarding_step", address],
      async () => {
        const response = await axios.get<{
          onboardingStep: OnboardingSteps;
        }>(`/api/${address}/get_onboarding_step`);
        return response.data;
      },
      {
        retry: false,
        refetchOnWindowFocus: false,
      }
    );

  const loader = useMemo(() => {
    return (
      <Center h="100vh">
        <CircularProgress isIndeterminate />
      </Center>
    );
  }, []);

  return (
    <PageTransition>
      {isLoading || (address && !isStepFetchedAfterMount) ? (
        loader
      ) : (
        <>
          {stepData?.onboardingStep &&
            stepData.onboardingStep !== OnboardingSteps.MintSuccess && (
              <OverlayOnboarding />
            )}
          {children}
        </>
      )}
    </PageTransition>
  );
};

export default HasSBT;
