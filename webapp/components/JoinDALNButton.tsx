import { Button, ButtonProps, Flex } from "@chakra-ui/react";
import axios, { AxiosError } from "axios";
import { useCallback, useState } from "react";
import { PlaidLinkOnSuccess, usePlaidLink } from "react-plaid-link";
import { useMutation } from "react-query";
import { useAccount } from "wagmi";

interface SetAccessTokenResponse {
  success: true;
  plaidItemId: string;
}

const setAccessToken = async ({
  public_token,
  address,
}: {
  public_token: string;
  address: string;
}) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_LAMBDA_SERVER_URL}/api/v1/set_access_token`,
    {
      public_token,
      address,
    }
  );
  return response.data;
};
interface JoinDALNButtonProps extends ButtonProps {
  linkToken?: string;
  onSuccess?: (data?: any, variables?: any, context?: any) => void;
}
export default function JoinDALNButton({
  linkToken,
  onClick = () => null,
  isDisabled,
  onSuccess = () => null,
  isLoading = false,
  ...props
}: JoinDALNButtonProps) {
  const [isPlaidLinkLoading, setIsPlaidLinkLoading] = useState(false);
  const { address } = useAccount();
  const { mutateAsync, isLoading: isLoadingSetAccessToken } = useMutation<
    SetAccessTokenResponse,
    AxiosError,
    { public_token: string; address: string }
  >(setAccessToken, {
    onSuccess(data, variables, context) {
      sessionStorage.setItem("plaidItemId", data.plaidItemId);
      onSuccess(data, variables, context);
    },
    onError(error) {
      console.log(`axios.post() failed: ${error}`);
    },
  });

  const sendPublicTokenToBackend: PlaidLinkOnSuccess = async (
    public_token,
    metadata
  ) => {
    setIsPlaidLinkLoading(false);
    if (!address) return;
    await mutateAsync({ public_token, address });
  };

  const { open, ready } = usePlaidLink({
    token: linkToken || "",
    onSuccess: sendPublicTokenToBackend,
  });

  return (
    <Flex justifyContent="center">
      <Button
        size="lg"
        maxWidth={382}
        flex={1}
        isLoading={isLoading || isLoadingSetAccessToken || isPlaidLinkLoading}
        isDisabled={!linkToken || !ready || isDisabled}
        onClick={() => {
          setIsPlaidLinkLoading(true);
          open();
        }}
        {...props}
      >
        Join DALN
      </Button>
    </Flex>
  );
}
