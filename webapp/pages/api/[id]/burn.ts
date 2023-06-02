import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

async function connectMongo() {
  const url = `mongodb+srv://admin:${process.env.DB_PASSWORD}@spndao.vjnl9b2.mongodb.net/?retryWrites=true&w=majority`;
  const dbClient = new MongoClient(url);
  const dbName = "daln";
  await dbClient.connect();

  const db = dbClient.db(dbName);
  const collection = db.collection("users");

  return collection;
}

interface SetOnboardingStep extends NextApiRequest {
  query: {
    id: string;
  };
}

export default async function handler(
  req: SetOnboardingStep,
  res: NextApiResponse
) {
  const collection = await connectMongo();

  const user = await collection.findOne({ address: req.query.id });

  if (user) {
    try {
      await collection.findOneAndDelete({ address: req.query.id });

      return res.status(201).send("User removed from collection");
    } catch (e) {
      return res.status(500).send("Error removing user from collection");
    }
  } else {
    return res.status(400).send("Error, user doesnt exist");
  }
}
