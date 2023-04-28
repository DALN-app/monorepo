import * as fs from "fs/promises";
import * as path from "path";

import lighthouse from "@lighthouse-web3/sdk";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";

interface UploadEncrypted extends NextApiRequest {
  body: {
    data: string;
    signedMessage: string;
    publicKey: string;
  };
}

export default async function handler(
  req: UploadEncrypted,
  res: NextApiResponse
) {
  try {
    const filename = uuidv4();

    const filePath = path.join("/tmp", `${filename}.json`);
    const fileContent = req.body.data;

    const file = await fs.writeFile(filePath, fileContent, "utf8");

    const readFile = await fs.readFile(filePath);

    console.log("File created: ", filePath);
    console.log("File content: ", readFile);
    console.log("file", file);

    const encryptedFile = (await lighthouse.uploadEncrypted(
      filePath,
      process.env.LIGHTHOUSE_API_KEY,
      req.body.publicKey,
      req.body.signedMessage
    )) as {
      data: {
        Name: string;
        Hash: string;
        Size: string;
      };
    }; // Display response

    console.log("encryptedFile", encryptedFile);

    return res.status(200).send(encryptedFile);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
