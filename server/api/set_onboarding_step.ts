import express, { Request, Response } from "express";
import { MongoClient } from "mongodb";

import { OnboardingSteps } from "../enums";

async function connectMongo() {
  const url = `mongodb+srv://admin:${process.env.DB_PASSWORD}@spndao.vjnl9b2.mongodb.net/?retryWrites=true&w=majority`;
  const dbClient = new MongoClient(url);
  const dbName = "daln";
  await dbClient.connect();

  const db = dbClient.db(dbName);
  const collection = db.collection("users");

  return collection;
}

const router = express.Router();

interface SetOnboardingStep extends Request {
  body: {
    onboardingStep: OnboardingSteps;
    cid?: string;
  };
  params: {
    id: string;
  };
}

router.post("/:id", async (req: SetOnboardingStep, res: Response) => {
  const { onboardingStep, cid } = req.body;

  const maybeOnboardingStep = (
    maybeOnboardingStep: unknown
  ): maybeOnboardingStep is keyof typeof OnboardingSteps => {
    return (
      Object.values(OnboardingSteps).indexOf(
        maybeOnboardingStep as OnboardingSteps
      ) !== -1
    );
  };

  if (onboardingStep && maybeOnboardingStep(onboardingStep)) {
    try {
      const collection = await connectMongo();

      const user = await collection.findOne({ address: req.query.id });
      const currentStepIndex = Object.values(OnboardingSteps).indexOf(
        user?.onboardingStep as OnboardingSteps
      );
      const newStepIndex =
        Object.values(OnboardingSteps).indexOf(onboardingStep);
      const lastStepIndex = Object.values(OnboardingSteps).length - 1;

      if (newStepIndex === 0 && currentStepIndex === lastStepIndex) {
        if (cid) {
          await collection.findOneAndUpdate(
            { address: req.query.id },
            { $set: { onboardingStep, cid } }
          );
        } else {
          await collection.findOneAndUpdate(
            { address: req.query.id },
            { $set: { onboardingStep } }
          );
        }
        return res.status(201).send("Onboarding step reset to step 1");
      } else if (newStepIndex <= currentStepIndex) {
        return res
          .status(400)
          .send("Cannot set a step that is before the current step");
      }

      if (cid) {
        await collection.findOneAndUpdate(
          { address: req.query.id },
          { $set: { onboardingStep, cid } }
        );
      } else {
        await collection.findOneAndUpdate(
          { address: req.query.id },
          { $set: { onboardingStep } }
        );
      }
      return res.status(201).send("Onboarding step updated");
    } catch (e) {
      return res.status(500).send("Error updating item");
    }
  } else {
    return res.status(400).send("Invalid onboarding step");
  }
});

export default router;