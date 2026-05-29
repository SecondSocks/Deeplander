import pino from 'pino'

const IS_PROD = process.env.NODE_ENV === 'production'

const REDACTED_PATHS = [
	'token',
	'apiKey',
	'api_key',
	'authorization',
	'password',
	'secret',
	'telegramToken',
	'TELEGRAM_BOT_TOKEN',
	'DEEPSEEK_API_KEY',
	'BOT_TOKEN',
	'API_KEY',
	'API_URL',
	'DATABASE_URL',
	'DIRECT_URL',
	'*.token',
	'*.apiKey',
	'*.api_key',
	'*.authorization'
]

export const logger = pino({
	level: process.env.LOG_LEVEL ?? 'info',
	redact: {
		paths: REDACTED_PATHS,
		remove: true // drop, не заменять на '[Redacted]'
	},
	transport: IS_PROD
		? undefined // stdout JSON — systemd/journald подхватит
		: {
				target: 'pino-pretty',
				options: {
					colorize: true,
					translateTime: 'SYS:HH:MM:ss',
					ignore: 'pid,hostname'
				}
			}
})
