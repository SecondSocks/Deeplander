import { env } from '../../app/env'

export const config = {
	telegram: {
		token: env.BOT_TOKEN
	},
	database: {
		url: env.DATABASE_URL
	},
	api: {
		key: env.API_KEY,
		url: env.API_URL,
		model: {
			flash: 'deepseek-v4-flash',
			pro: 'deepseek-v4-pro'
		}
	}
}
