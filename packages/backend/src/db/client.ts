import type { SDK } from "caido:plugin";
import type { Database } from "sqlite";

let dbInstance: Database | undefined;

export const getDb = async (sdk: SDK): Promise<Database> => {
  if (dbInstance) return dbInstance;
  dbInstance = await sdk.meta.db();
  return dbInstance;
};
