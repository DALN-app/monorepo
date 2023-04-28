import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

async function getAccessToken(item_id: string) {
  const url = `mongodb+srv://admin:${process.env.DB_PASSWORD}@spndao.vjnl9b2.mongodb.net/?retryWrites=true&w=majority`;
  const dbClient = new MongoClient(url);
  const dbName = "daln";

  // await dbClient.connect();

  const db = dbClient.db(dbName);
  const collection = db.collection("users");

  const item = await collection.findOne({ plaid_item_id: item_id });

  console.log("item", item);

  return item?.plaid_access_token as string;
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const itemId = req.body.itemId;
  if (!itemId) {
    return res.status(400).send("Missing item ID");
  }

  console.log("itemId", itemId);

  const access_token = await getAccessToken(itemId as string);

  console.log("access_token", access_token);

  const client = new PlaidApi(configuration);

  const transactions = [];
  let hasMore = true;
  let cursor = undefined as string | undefined;

  while (hasMore) {
    const transactionsSyncRes = await client.transactionsSync({
      access_token: access_token,
      ...(cursor ? { cursor } : {}),
    });

    console.log("transactionsSyncRes", transactionsSyncRes.data);
    transactions.push(...transactionsSyncRes.data.added);

    hasMore = transactionsSyncRes.data.has_more;
    cursor = transactionsSyncRes.data.next_cursor;
  }

  console.log("transactions", transactions);

  try {
    return res.status(200).send({ ...transactions });
  } catch (e) {
    return res.status(500).send(e);
  }
}
