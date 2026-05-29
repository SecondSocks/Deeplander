import { cleanEnv, str } from 'envalid'

export const env = cleanEnv(process.env, {
	BOT_TOKEN: str(),
	API_KEY: str(),
	API_URL: str(),
	DATABASE_URL: str(),
	DIRECT_URL: str()
})
