import express, { Request, Response } from "express";
import { MongoClient } from "mongodb";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { OnboardingSteps } from "../enums";

async function setToken(
  userId: string,
  token: string,
  itemId: string,
  address: string
) {
  const url = `mongodb+srv://admin:${process.env.DB_PASSWORD}@spndao.vjnl9b2.mongodb.net/?retryWrites=true&w=majority`;
  const dbClient = new MongoClient(url);
  const dbName = "daln";
  await dbClient.connect();

  const db = dbClient.db(dbName);
  const collection = db.collection("users");

  await collection.insertOne({
    name: userId,
    address,
    onboardingStep: OnboardingSteps.Processing,
    plaid_access_token: token,
    plaid_item_id: itemId,
    plaid_history_synced: false,
  });
}

interface SetTokenProps extends Request {
  body: {
    public_token: string;
    address: string;
  };
}

const router = express.Router();

router.post("/", async (req: SetTokenProps, res: Response) => {
  const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
        "PLAID-SECRET": process.env.PLAID_SECRET,
      },
    },
  });

  const client = new PlaidApi(configuration);

  let plaidItemId = "";

  await client
    .itemPublicTokenExchange({
      public_token: req.body.public_token,
    })
    .then(async (response) => {
      plaidItemId = response.data.item_id;
      await setToken(
        "abc",
        response.data.access_token,
        response.data.item_id,
        req.body.address
      ).catch((error) => {
        console.log(`setToken() failed: ${error}`);
        res.status(500).send(error);
      });

      // init the tx sync
      await client
        .transactionsSync({
          access_token: response.data.access_token,
        })
        .catch((error) => {
          console.log(`transactionsSync() failed: ${error}`);
          res.status(500).send(error);
        });
    })
    .catch((error) => {
      console.log(`exchange public token failed: ${error}`);
      console.log(`public_token: ${req.body.public_token}`);
      res.status(500).send(error);
    })
    .finally(() => {
      res.status(200).json({ success: true, plaidItemId });
    });
});

export default router;
