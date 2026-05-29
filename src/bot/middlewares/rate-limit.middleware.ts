import type { RateLimitService } from '../../modules/rate-limit/rate-limit.service'
import {
	RATE_LIMIT_DEFAULTS,
	RATE_LIMIT_KEYS
} from '../../shared/constants/rate-limit.constants'
import type { IBotContext } from '../../shared/types/bot-context.types'

export const createRateLimitMiddleware = (
	rateLimitService: RateLimitService
) => {
	return async (ctx: IBotContext, next: () => Promise<void>) => {
		const userId = ctx.user?.id // из registerUserMiddleware
		if (!userId) return next()

		const minuteResult = await rateLimitService.check({
			key: RATE_LIMIT_KEYS.AI_PER_MINUTE,
			userId,
			...RATE_LIMIT_DEFAULTS[RATE_LIMIT_KEYS.AI_PER_MINUTE]
		})

		if (!minuteResult.allowed) {
			const seconds = Math.ceil(
				(minuteResult.resetAt.getTime() - Date.now()) / 1000
			)
			await ctx.reply(`Слишком много запросов. Попробуй через ${seconds} сек.`)
			return
		}

		const dayResult = await rateLimitService.check({
			key: RATE_LIMIT_KEYS.AI_PER_DAY,
			userId,
			...RATE_LIMIT_DEFAULTS[RATE_LIMIT_KEYS.AI_PER_DAY]
		})

		if (!dayResult.allowed) {
			const hours = Math.ceil(
				(dayResult.resetAt.getTime() - Date.now()) / 3_600_000
			)
			await ctx.reply(
				`Дневной лимит исчерпан. Лимит обновится через ~${hours} ч.`
			)
			return
		}

		return next()
	}
}
