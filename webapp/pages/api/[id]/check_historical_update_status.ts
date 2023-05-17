import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

const url = `mongodb+srv://admin:${process.env.DB_PASSWORD}@spndao.vjnl9b2.mongodb.net/?retryWrites=true&w=majority`;
const dbClient = new MongoClient(url);
const dbName = "daln";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const itemId = req.query.id;

  await dbClient.connect();

  const db = dbClient.db(dbName);
  const collection = db.collection("users");

  try {
    const item = await collection.findOne({ plaid_item_id: itemId });
    return res.status(200).send({ isSynced: !!item?.plaid_history_synced });
  } catch (e) {
    return res.status(500).send(e);
  }
}
