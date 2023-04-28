import { Flex, Link, Text } from "@chakra-ui/react";

import DecryptedLockedSvgComponent from "~~/components/svgComponents/DecryptedLockedSvgComponent";
import EncryptedLockedSvgComponent from "~~/components/svgComponents/EncryptedLockedSvgComponent";

function EncryptedStatus({
  isDecrypted,
  cid,
}: {
  isDecrypted: boolean;
  cid: string;
}) {
  return (
    <Flex alignItems="center" width={"140px"} paddingLeft={isDecrypted ? 0 : 1}>
      {isDecrypted ? (
        <Flex alignItems="center" height={"40px"}>
          <Link
            isExternal
            href={`https://files.lighthouse.storage/viewFile/${cid}`}
          >
            <DecryptedLockedSvgComponent />
            <Text marginLeft={2}>Decrypted </Text>
          </Link>
        </Flex>
      ) : (
        <Flex alignItems="center" height={"40px"}>
          <EncryptedLockedSvgComponent />
          <Text marginLeft={2}>Encrypted </Text>
        </Flex>
      )}
    </Flex>
  );
}

export default EncryptedStatus;
