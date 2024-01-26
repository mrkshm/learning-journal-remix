import type { Config } from 'drizzle-kit';
import { env } from '~/config/env';

if (!env.DATABASE_PATH) {
	throw new Error('DATABASE_PATH environment variable is not set');
}

export default {
	schema: './app/db/schema.server.ts',
	out: './drizzle',
	driver: 'better-sqlite',
	dbCredentials: {
		url: env.DATABASE_PATH
	}
} satisfies Config;