import express, { Request, Response } from "express";
import { MongoClient } from "mongodb";

const url = `mongodb+srv://admin:${process.env.DB_PASSWORD}@spndao.vjnl9b2.mongodb.net/?retryWrites=true&w=majority`;
const dbClient = new MongoClient(url);
const dbName = "daln";

const router = express.Router();

router.get("/:id", async (req: Request, res: Response) => {
  const itemId = req.params.id;

  await dbClient.connect();

  const db = dbClient.db(dbName);
  const collection = db.collection("users");

  try {
    const item = await collection.findOne({ plaid_item_id: itemId });
    return res.status(200).send({ isSynced: !!item?.plaid_history_synced });
  } catch (e) {
    return res.status(500).send(e);
  }
});

export default router;
