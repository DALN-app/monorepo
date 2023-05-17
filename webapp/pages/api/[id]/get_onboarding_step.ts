import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

import { OnboardingSteps } from "~~/types/onboarding";

const url = `mongodb+srv://admin:${process.env.DB_PASSWORD}@spndao.vjnl9b2.mongodb.net/?retryWrites=true&w=majority`;
const dbClient = new MongoClient(url);
const dbName = "daln";

interface GetOnboardingStep extends NextApiRequest {
  query: {
    id: string;
  };
}

export default async function handler(
  req: GetOnboardingStep,
  res: NextApiResponse
) {
  const address = req.query.id;

  if (address) {
    await dbClient.connect();

    const db = dbClient.db(dbName);
    const collection = db.collection("users");

    try {
      const user = await collection.findOne({ address });

      if (user) {
        return res.status(200).json({
          onboardingStep: user.onboardingStep as OnboardingSteps,
          plaidItemId: user.plaid_item_id as string | undefined,
          cid: user.cid as string | undefined,
        });
      } else {
        return res.status(404).send("User not found");
      }
    } catch (e) {
      return res.status(500).send("Error fetching onboarding step");
    }
  } else {
    return res.status(400).send("Invalid address");
  }
}
