import { MongoClient } from "mongodb";

// Connect lazily so `next build` works without a database.
export async function getDb() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  const client = await (globalThis.__mongo ??= new MongoClient(process.env.MONGODB_URI).connect());
  return client.db(process.env.MONGODB_DB || "labtrack");
}
