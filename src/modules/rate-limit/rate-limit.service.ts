import type { Logger } from 'pino'
import type { PrismaClient } from '../../generated/prisma/client'
import {
	RATE_LIMIT_DEFAULTS,
	RATE_LIMIT_KEYS
} from '../../shared/constants/rate-limit.constants'

interface IRateLimitConfig {
	key: string
	userId: string
	maxCount: number
	windowMs: number
}

interface IRateLimitResult {
	allowed: boolean
	remaining: number
	resetAt: Date
}

interface ITokenLimitResult {
	allowed: boolean
	used: number
	limit: number
	resetAt: Date
}

export class RateLimitService {
	constructor(
		private readonly prisma: PrismaClient,
		private readonly logger: Logger
	) {}

	async check(config: IRateLimitConfig): Promise<IRateLimitResult> {
		const now = new Date()

		return this.prisma.$transaction(async tx => {
			const window = await tx.rateLimitWindow.findFirst({
				where: {
					userId: config.userId,
					key: config.key,
					windowEnd: { gt: now }
				}
			})

			if (!window) {
				const windowStart = now
				const windowEnd = new Date(now.getTime() + config.windowMs)

				await tx.rateLimitWindow.create({
					data: {
						userId: config.userId,
						key: config.key,
						count: 1,
						windowStart,
						windowEnd
					}
				})

				return {
					allowed: true,
					remaining: config.maxCount - 1,
					resetAt: windowEnd
				}
			}

			if (window.count >= config.maxCount) {
				return { allowed: false, remaining: 0, resetAt: window.windowEnd }
			}

			await tx.rateLimitWindow.update({
				where: { id: window.id },
				data: { count: { increment: 1 } }
			})

			return {
				allowed: true,
				remaining: config.maxCount - window.count - 1,
				resetAt: window.windowEnd
			}
		})
	}

	async cleanupExpired(): Promise<void> {
		const deleted = await this.prisma.rateLimitWindow.deleteMany({
			where: { windowEnd: { lt: new Date() } }
		})
		this.logger.info(
			{ deleted: deleted.count },
			'rate limit windows cleaned up'
		)
	}

	async checkAndConsumeTokens(
		userId: string,
		tokensToAdd: number
	): Promise<ITokenLimitResult> {
		const limits = [
			{
				key: RATE_LIMIT_KEYS.TOKENS_PER_DAY,
				...RATE_LIMIT_DEFAULTS[RATE_LIMIT_KEYS.TOKENS_PER_DAY]
			},
			{
				key: RATE_LIMIT_KEYS.TOKENS_PER_WEEK,
				...RATE_LIMIT_DEFAULTS[RATE_LIMIT_KEYS.TOKENS_PER_WEEK]
			},
			{
				key: RATE_LIMIT_KEYS.TOKENS_PER_MONTH,
				...RATE_LIMIT_DEFAULTS[RATE_LIMIT_KEYS.TOKENS_PER_MONTH]
			}
		] as const

		const windows = await Promise.all(
			limits.map(limit =>
				this._getOrCreateWindow(userId, limit.key, limit.windowMs)
			)
		)

		for (let i = 0; i < limits.length; i++) {
			const win = windows[i]!
			const limit = limits[i]!
			if (win.count + tokensToAdd > limit.maxCount) {
				return {
					allowed: false,
					used: win.count,
					limit: limit.maxCount,
					resetAt: win.windowEnd
				}
			}
		}

		await this.prisma.$transaction(
			limits.map(limit =>
				this.prisma.rateLimitWindow.updateMany({
					where: { userId, key: limit.key, windowEnd: { gt: new Date() } },
					data: { count: { increment: tokensToAdd } }
				})
			)
		)

		const firstWindow = windows[0]!
		const firstLimit = limits[0]!

		return {
			allowed: true,
			used: firstWindow.count + tokensToAdd,
			limit: firstLimit.maxCount,
			resetAt: firstWindow.windowEnd
		}
	}

	async getTokenStats(userId: string): Promise<{
		day: { used: number; limit: number; resetAt: Date } | null
		week: { used: number; limit: number; resetAt: Date } | null
		month: { used: number; limit: number; resetAt: Date } | null
	}> {
		const now = new Date()
		const keys = [
			{ key: RATE_LIMIT_KEYS.TOKENS_PER_DAY, field: 'day' as const },
			{ key: RATE_LIMIT_KEYS.TOKENS_PER_WEEK, field: 'week' as const },
			{ key: RATE_LIMIT_KEYS.TOKENS_PER_MONTH, field: 'month' as const }
		]

		const windows = await this.prisma.rateLimitWindow.findMany({
			where: {
				userId,
				key: { in: keys.map(k => k.key) },
				windowEnd: { gt: now }
			}
		})

		const result = { day: null, week: null, month: null } as {
			day: { used: number; limit: number; resetAt: Date } | null
			week: { used: number; limit: number; resetAt: Date } | null
			month: { used: number; limit: number; resetAt: Date } | null
		}

		for (const { key, field } of keys) {
			const win = windows.find(w => w.key === key)
			const limit = RATE_LIMIT_DEFAULTS[key].maxCount
			result[field] = {
				used: win?.count ?? 0,
				limit,
				resetAt:
					win?.windowEnd ??
					new Date(now.getTime() + RATE_LIMIT_DEFAULTS[key].windowMs)
			}
		}

		return result
	}

	private async _getOrCreateWindow(
		userId: string,
		key: string,
		windowMs: number
	) {
		const now = new Date()

		const existing = await this.prisma.rateLimitWindow.findFirst({
			where: { userId, key, windowEnd: { gt: now } }
		})

		if (existing) return existing

		const windowEnd = new Date(now.getTime() + windowMs)
		return this.prisma.rateLimitWindow.create({
			data: { userId, key, count: 0, windowStart: now, windowEnd }
		})
	}
}
