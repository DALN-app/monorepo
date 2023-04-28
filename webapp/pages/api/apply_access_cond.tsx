import * as fs from "fs/promises";
import * as path from "path";

import lighthouse from "@lighthouse-web3/sdk";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import { BigNumberish } from "ethers";

interface UploadEncrypted extends NextApiRequest {
  body: {
    cid: string;
    tokenId: BigNumberish;
    signedMessage: string;
    publicKey: string;
  };
}

export default async function handler(
  req: UploadEncrypted,
  res: NextApiResponse
) {
  try {
    const conditions = [
      {
        id: 1,
        chain: "Hyperspace",
        contractAddress: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS,
        parameters: [req.body.tokenId],
        method: "getIsTokenDecrypted",
        standardContractType: "Custom",
        inputArrayType: ["uint256"],
        outputType: "bool",
        returnValueTest: {
          comparator: "==",
          value: "true",
        },
      },
      {
        id: 2,
        chain: "Hyperspace",
        contractAddress: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS,
        parameters: [":userAddress"],
        method: "isAdmin",
        standardContractType: "Custom",
        inputArrayType: ["address"],
        outputType: "bool",
        returnValueTest: {
          comparator: "==",
          value: "true",
        },
      },
    ];

    const aggregator = "([1] and [2])";

    /*
        accessCondition(publicKey, cid, signedMessage, conditions, aggregator)
          Parameters:
            publicKey: owners public key
            CID: CID of the file to decrypt
            signedMessage: message signed by the owner of publicKey
            conditions: should be in a format like above
            aggregator: aggregator to apply conditions
      */
    const response = await lighthouse.applyAccessCondition(
      req.body.publicKey,
      req.body.cid,
      req.body.signedMessage,
      conditions,
      aggregator
    );

    console.log("response accCond:", response);

    return res.status(200).send(response);
  } catch (error) {
    console.log('error', error);
    return res.status(500).send(error);
  }
}
