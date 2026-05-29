export const RATE_LIMIT_KEYS = {
	AI_PER_MINUTE: 'ai:minute',
	AI_PER_DAY: 'ai:day',
	COMMANDS_PER_MINUTE: 'commands:minute',
	TOKENS_PER_DAY: 'tokens:day',
	TOKENS_PER_WEEK: 'tokens:week',
	TOKENS_PER_MONTH: 'tokens:month'
} as const

export type TRateLimitKey =
	(typeof RATE_LIMIT_KEYS)[keyof typeof RATE_LIMIT_KEYS]

const DAY_MS = 86_400_000

export const RATE_LIMIT_DEFAULTS = {
	[RATE_LIMIT_KEYS.AI_PER_MINUTE]: { maxCount: 5, windowMs: 60_000 },
	[RATE_LIMIT_KEYS.AI_PER_DAY]: { maxCount: 100, windowMs: DAY_MS },
	[RATE_LIMIT_KEYS.COMMANDS_PER_MINUTE]: { maxCount: 20, windowMs: 60_000 },
	[RATE_LIMIT_KEYS.TOKENS_PER_DAY]: { maxCount: 50_000, windowMs: DAY_MS },
	[RATE_LIMIT_KEYS.TOKENS_PER_WEEK]: {
		maxCount: 200_000,
		windowMs: DAY_MS * 7
	},
	[RATE_LIMIT_KEYS.TOKENS_PER_MONTH]: {
		maxCount: 500_000,
		windowMs: DAY_MS * 30
	}
} as const
