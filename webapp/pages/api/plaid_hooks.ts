import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

const url = `mongodb+srv://admin:${process.env.DB_PASSWORD}@spndao.vjnl9b2.mongodb.net/?retryWrites=true&w=majority`;
const dbClient = new MongoClient(url);
const dbName = "daln";

interface PlaidHook extends NextApiRequest {
  body: {
    webhook_code: string;
    webhook_type: string;
    item_id: string;
    new_transactions: number;
  };
}

function logHook(req: PlaidHook) {
  console.log("---------------------------------------");
  console.log(`webhook_code: ${req.body.webhook_code}`);
  console.log(`webhook_type: ${req.body.webhook_type}`);
  console.log(`item_id: ${req.body.item_id}`);
  console.log(`new_transactions: ${req.body.new_transactions}`);
  console.log(`webhook_code: ${req.body.webhook_code}`);
}

export default async function handler(req: PlaidHook, res: NextApiResponse) {
  logHook(req);

  if (req.body.webhook_code === "HISTORICAL_UPDATE") {
    await dbClient.connect();

    const db = dbClient.db(dbName);
    const collection = db.collection("users");

    try {
      await collection.findOneAndUpdate(
        { plaid_item_id: req.body.item_id },
        { $set: { plaid_history_synced: true } }
      );
      return res.status(201).send("History synced");
    } catch (e) {
      return res.status(500).send("Error updating item");
    }
  } else {
    return res.status(200).send("Hook received, but not processed");
  }
}
