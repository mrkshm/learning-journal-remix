import { z, ZodObject, ZodRawShape } from 'zod';

export type EnvParserConfig<S extends ZodObject<ZodRawShape>> = {
  schema: S;
  data?: Record<string, string>;
};

const castStringToNumber = (value: string) => isNaN(Number(value)) ? value : Number(value);
const castStringToBoolean = (value: string) => value === 'true' ? true : value === 'false' ? false : value;

function processEnvironmentVariables<S extends ZodObject<ZodRawShape>>(schema: S, data?: Record<string, string>): Record<string, string | number | boolean> {
  const processEnv = (data || process.env) as Record<string, string>;
  const result: Record<string, string | number | boolean> = {};

  for (const key of Object.keys(processEnv)) {
    if (Object.keys(schema.shape).includes(key)) {
      result[key] = processEnv[key];
    }
  }

  return result;
}

function castEnvironmentVariables(envVariables: Record<string, string | number | boolean>): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(envVariables)) {
    if (typeof value === 'string') {
      result[key] = castStringToNumber(value);
      result[key] = castStringToBoolean(result[key] as string);
    } else {
      result[key] = value;
    }
  }

  return result;
}

const parseEnv = <S extends ZodObject<ZodRawShape>>({ schema, data }: EnvParserConfig<S>): z.infer<S> => {
  const envVariables = processEnvironmentVariables(schema, data);
  const castedEnvVariables = castEnvironmentVariables(envVariables);

  const parseResult = schema.safeParse(castedEnvVariables);
  if (!parseResult.success) {
    throw new Error(`Environment variable validation failed: ${JSON.stringify(parseResult.error.issues)}`);
  }

  return parseResult.data;
};

export default parseEnv;
