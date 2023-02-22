import { Box, Card as ChakraUiCard, ChakraProps } from "@chakra-ui/react";
import React from "react";

interface CenteredCardProps extends ChakraProps {
  children: React.ReactNode;
  prependedContent?: React.ReactNode;
  appendedContent?: React.ReactNode;
}

const Card: React.FC<CenteredCardProps> = ({
  prependedContent,
  children,
  appendedContent,
  ...props
}) => {
  return (
    <Box {...props}>
      {prependedContent && <Box mb={16}>{prependedContent}</Box>}
      <ChakraUiCard p={12}>{children}</ChakraUiCard>
      {appendedContent && <Box>{appendedContent}</Box>}
    </Box>
  );
};

export default Card;
