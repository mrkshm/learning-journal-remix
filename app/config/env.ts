import { z } from "zod";
import parseEnv from "./env-parser";

export const env = parseEnv({
  schema: z.object({
    DATABASE_PATH: z.string(),
  })
})