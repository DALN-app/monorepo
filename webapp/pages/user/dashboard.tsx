import { watch } from "fs";

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Heading,
  SimpleGrid,
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import Head from "next/head";
import { useAccount } from "wagmi";

import { NextPageWithLayout } from "../_app";

import { DashboardStat, BurnSBT } from "~~/components/Dashboard";
import ConnectedLayout from "~~/components/layouts/ConnectedLayout";
import PageTransition from "~~/components/PageTransition";
import { useBasicFevmDalnTokenOfOwnerByIndex } from "~~/generated/wagmiTypes";

const Dashboard: NextPageWithLayout = () => {
  const { address } = useAccount();

  const userTokenIdQuery = useBasicFevmDalnTokenOfOwnerByIndex({
    address: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`,
    args: [address || "0x0", BigNumber.from(0)],
    enabled: !!address,
    watch: true,
  });

  return (
    <>
      <Head>
        <title>DALN - Dashboard</title>
      </Head>
      <PageTransition>
        <Container
          maxW="container.xl"
          mt={{
            base: 4,
            md: 16,
            lg: 24,
          }}
        >
          <Card w="full">
            <CardHeader>
              <Flex justifyContent="flex-end" alignItems="center">
                <BurnSBT tokenId={userTokenIdQuery.data} />
              </Flex>

              <Heading
                as="h1"
                size="md"
                fontWeight={500}
                textAlign="center"
                mb={2}
              >
                Manage DALN membership token
              </Heading>
            </CardHeader>

            <CardBody>
              <SimpleGrid columns={[1, 2]} spacing={5}>
                <DashboardStat label="Rewards" helpText="Matic" number="1.27" />
                <DashboardStat label="Decryption Sessions" number="5" />
                <DashboardStat
                  label="Token ID"
                  number={userTokenIdQuery.data?.toString() || "Error"}
                />
                <DashboardStat
                  label="SBT Contract"
                  number={
                    (
                      process.env
                        .NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`
                    ).slice(0, 6) +
                    "..." +
                    (
                      process.env
                        .NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`
                    ).slice(-5)
                  }
                  href={`https://beryx.zondax.ch/v1/search/fil/hyperspace/address/${
                    process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as string
                  }`}
                  isExternalHref
                />
              </SimpleGrid>
            </CardBody>
          </Card>
        </Container>
      </PageTransition>
    </>
  );
};

Dashboard.getLayout = function getLayout(page) {
  return <ConnectedLayout>{page}</ConnectedLayout>;
};

export default Dashboard;
