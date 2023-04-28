import {
  Box,
  Center,
  Heading,
  Text,
  Spinner,
  Card,
  Button,
  Flex,
  Container,
} from "@chakra-ui/react";
import axios from "axios";
import { BigNumber } from "ethers";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useAccount } from "wagmi";

import ConnectedLayout from "~~/components/layouts/ConnectedLayout";
import DataBaseSvgComponent from "~~/components/svgComponents/DataBaseSvgComponent";
import SuccessSvgComponent from "~~/components/svgComponents/SuccessSvgComponent";
import UploadUserDataProgressBar from "~~/components/UploadUserDataProgressBar";
import {
  basicFevmDalnABI,
  useBasicFevmDalnTokenOfOwnerByIndex,
} from "~~/generated/wagmiTypes";
import usePrepareWriteAndWaitTx from "~~/hooks/usePrepareWriteAndWaitTx";
import useUploadEncrypted from "~~/hooks/useUploadEncrypted";
import { NextPageWithLayout } from "~~/pages/_app";

const steps = {
  processing: {
    number: 1,
    title: "Waiting for Plaid data processing",
    subtitle: "Plaid is updating your data. This may take a few minutes.",
  },
  fetchingPlaid: {
    number: 2,
    title: "Fetching your data from Plaid",
    subtitle:
      "Your data is being fetched from Plaid to be encrypted and stored on decentralized storage.",
  },
  encryption: {
    number: 3,
    title: "Encrypt your data",
    subtitle:
      "After encryption, your file will be stored on decentralized storage provided by IPFS.",
  },
  minting: {
    number: 4,
    title: "Encryption successful! Mint your token now",
    subtitle:
      "You will be asked to review and confirm the minting from your wallet.",
  },
  setAccess: {
    number: 5,
    title: "Set access condition",
    subtitle:
      "Sign this transaction to set the access condition for your data. Only authorized parties such as DAO admins can decrypt and access your data. You will be rewarded whenever your data is decrypted and processed.",
  },
  mintSuccess: {
    number: 6,
    title: "Token mint successful",
    subtitle:
      "You can always burn the token in the personal dashboard if you wish to exit from the DAO and stop sharing your encrypted data.",
  },
};

const getHistoricalUpdateStatus = async (plaidItemId: string) => {
  const response = await axios.get(
    `/api/check_historical_update_status/${plaidItemId}`
  );
  return response.data;
};

const getPlaidTransactionSync = async (plaidItemId: string) => {
  const response = await axios.post(`/api/plaid_transaction_sync`, {
    itemId: plaidItemId,
  });
  return response.data;
};

const UploadDataPage: NextPageWithLayout = () => {
  const [step, setStep] = useState<keyof typeof steps>("processing");

  const [cid, setCid] = useState<string | null>(null);

  const progress = useMemo(
    () => Math.round((100 / Object.keys(steps).length) * steps[step].number),
    [step]
  );

  const { address: userAddress } = useAccount();

  const userTokenIdQuery = useBasicFevmDalnTokenOfOwnerByIndex({
    address: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`,
    args: [userAddress || "0x0", BigNumber.from(0)],
    enabled: !!userAddress && step === "setAccess",
    watch: true,
  });

  const plaidItemId = sessionStorage.getItem("plaidItemId");

  const historicalUpdateStatusQuery = useQuery(
    ["check_historical_update_status", plaidItemId],
    () => getHistoricalUpdateStatus(plaidItemId as string),
    {
      enabled: !!plaidItemId && step === "processing",
      onSuccess: (data) => {
        setStep("fetchingPlaid");
      },
      refetchInterval: 500,
    }
  );

  const plaidTransactionSync = useMutation(
    ["plaid_transaction_sync", plaidItemId],
    () => getPlaidTransactionSync(plaidItemId as string),
    {
      onSuccess: (data) => {
        console.log("plaidTransactionSync", data);
        setStep("encryption");
      },
    }
  );

  const {
    uploadFileEncrypted,
    setAccessCondition,
    uploadEncryptedMutation,
    applyAccessConditionMutation,
  } = useUploadEncrypted();

  const mintToken = usePrepareWriteAndWaitTx(
    {
      address: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`,
      abi: basicFevmDalnABI,
      functionName: "safeMint",
      args: [cid],
      enabled:
        !!process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS &&
        !!userAddress &&
        !!cid,
    },
    {
      onTxConfirmed: () => {
        setStep("setAccess");
      },
    }
  );

  useEffect(() => {
    void (async () => {
      if (step === "fetchingPlaid" && plaidTransactionSync.isIdle) {
        await plaidTransactionSync.mutateAsync();
      }
    })();
  }, [plaidTransactionSync, step]);

  useEffect(() => {
    if (step === "encryption" && uploadEncryptedMutation.isSuccess) {
      setStep("minting");
    }
  }, [step, uploadEncryptedMutation.isSuccess]);

  useEffect(() => {
    if (step === "setAccess" && applyAccessConditionMutation.isSuccess) {
      setStep("mintSuccess");
    }
  }, [applyAccessConditionMutation.isSuccess, step]);

  const loadingStep = useMemo(
    () => (
      <Card
        height={"300px"}
        maxWidth={"680px"}
        flex={1}
        borderStyle={"dashed"}
        borderWidth={1}
        borderColor="rgba(0, 0, 0, 0.3)"
        justifyContent="center"
      >
        <Container centerContent>
          <Spinner
            alignSelf="center"
            emptyColor="rgba(64, 117, 255, 0.2)"
            color="#4075FF"
            mb={6}
            mt={"69px"}
          />
          <Text textAlign="center" fontSize="md" mb={1} color="#4A5568">
            This may take a while...
          </Text>{" "}
          <Text textAlign="center" fontSize="md" color="#4A5568" mb={"69px"}>
            Please do not close your browser
          </Text>
        </Container>
      </Card>
    ),
    []
  );

  const encryptionStep = useMemo(
    () => (
      <Card
        height={"300px"}
        maxWidth={"680px"}
        flex={1}
        border="none"
        justifyContent="center"
      >
        <Container>
          <Center>
            <DataBaseSvgComponent />
          </Center>
          <Text textAlign="center" fontSize="md" color="#4A5568">
            Sign and encrypt your data
          </Text>
          <Flex flex={1} justifyContent="center" mt={10}>
            <Button
              maxWidth={320}
              size="lg"
              flex={1}
              mb={2}
              isLoading={uploadEncryptedMutation.isLoading}
              onClick={async () => {
                const data = JSON.stringify(plaidTransactionSync.data, null, 2);
                const res = await uploadFileEncrypted(data);
                if (!res) {
                  console.error("Error uploading encrypted file");
                } else {
                  setCid(res.data.Hash);
                }
              }}
            >
              Encrypt data
            </Button>
          </Flex>
        </Container>
      </Card>
    ),
    [
      plaidTransactionSync.data,
      uploadEncryptedMutation.isLoading,
      uploadFileEncrypted,
    ]
  );

  const mintingStep = useMemo(
    () => (
      <Card
        height={"300px"}
        maxWidth={"680px"}
        flex={1}
        border="none"
        justifyContent="center"
      >
        <Container>
          <Center>
            <DataBaseSvgComponent />
          </Center>
          <Text textAlign="center" fontSize="md" color="#4A5568">
            The token is free to mint but you will pay a small gas fee in Matic
          </Text>
          <Flex flex={1} justifyContent="center" mt={10}>
            <Button
              maxWidth={320}
              size="lg"
              flex={1}
              mb={2}
              isDisabled={!mintToken.write}
              isLoading={mintToken.isLoading}
              onClick={() => {
                if (mintToken.write) {
                  mintToken.write();
                }
              }}
            >
              Mint token
            </Button>
          </Flex>
        </Container>
      </Card>
    ),
    [mintToken]
  );

  const setAccessStep = useMemo(
    () => (
      <Card
        height={"300px"}
        maxWidth={"680px"}
        flex={1}
        border="none"
        justifyContent="center"
      >
        <Container>
          <Center>
            <DataBaseSvgComponent />
          </Center>
          <Text textAlign="center" fontSize="md" color="#4A5568">
            Sign to set access condition
          </Text>
          <Flex flex={1} justifyContent="center" mt={10}>
            <Button
              maxWidth={320}
              size="lg"
              flex={1}
              mb={2}
              isLoading={
                applyAccessConditionMutation.isLoading ||
                userTokenIdQuery.isLoading
              }
              onClick={() => {
                if (userTokenIdQuery.data === undefined) {
                  console.error("TokenId not ready");
                  return;
                }
                if (!cid) {
                  console.error("CID undefined");
                  return;
                }
                void setAccessCondition(cid, userTokenIdQuery.data.toNumber());
              }}
            >
              Set access condition
            </Button>
          </Flex>
        </Container>
      </Card>
    ),
    [
      applyAccessConditionMutation.isLoading,
      cid,
      setAccessCondition,
      userTokenIdQuery.data,
      userTokenIdQuery.isLoading,
    ]
  );

  return (
    <Center
      sx={{
        flex: 1,
      }}
    >
      <Box alignSelf="center" width="80vw" overflow={"hidden"}>
        <Heading as="h1" size="lg" textAlign="center" mb={2}>
          {steps[step].title}
        </Heading>
        <Text textAlign="center" fontSize="lg" mb={16} color="#4A5568">
          {steps[step].subtitle}
        </Text>
        <Center alignItems="center">
          {(step === "processing" || step === "fetchingPlaid") && loadingStep}
          {step === "encryption" && encryptionStep}
          {step === "minting" && mintingStep}
          {step === "setAccess" && setAccessStep}
          {step === "mintSuccess" && (
            <Container>
              <Flex flex={1} justifyContent="center">
                <SuccessSvgComponent />
              </Flex>
              <Flex flex={1} justifyContent="center" mt={20}>
                <Link href="/user/dashboard">
                  <Button maxWidth={320} size="lg" flex={1} mb={2}>
                    View in dashboard
                  </Button>
                </Link>
              </Flex>
            </Container>
          )}
        </Center>
        {step === "mintSuccess" ? null : (
          <UploadUserDataProgressBar progress={progress} />
        )}
      </Box>
    </Center>
  );
};

UploadDataPage.getLayout = function getLayout(page) {
  return <ConnectedLayout>{page}</ConnectedLayout>;
};

export default UploadDataPage;
