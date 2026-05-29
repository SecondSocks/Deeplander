import { prisma } from '../../../prisma.service'
import { StatsRepository } from '../../entities/stats/stats.repository'
import { logger } from '../../infra/logger/logger.service'
import { RateLimitService } from '../../modules/rate-limit/rate-limit.service'
import type { IBotContext } from '../../shared/types/bot-context.types'

const statsRepository = new StatsRepository()
const rateLimitService = new RateLimitService(prisma, logger)

const formatRow = (
	label: string,
	data: { used: number; limit: number; resetAt: Date } | null
): string => {
	if (!data) return `${label}: —`
	const remaining = data.limit - data.used
	const resetIn = Math.ceil((data.resetAt.getTime() - Date.now()) / 3_600_000)
	return `${label}: ${remaining.toLocaleString()} / ${data.limit.toLocaleString()} (сброс через ${resetIn} ч.)`
}

export const onStatsCommand = async (ctx: IBotContext) => {
	if (!ctx.user) return

	const [stats, tokenStats] = await Promise.all([
		statsRepository.getTodayStats(ctx.user.id),
		rateLimitService.getTokenStats(ctx.user.id)
	])

	await ctx.reply(
		[
			'📊 <b>Статистика</b>',
			'',
			`Запросы сегодня: ${stats.requests}`,
			`Токенов потрачено сегодня: ${stats.totalTokens.toLocaleString()}`,
			'',
			'<b>Осталось токенов:</b>',
			formatRow('День  ', tokenStats.day),
			formatRow('Неделя', tokenStats.week),
			formatRow('Месяц ', tokenStats.month)
		].join('\n'),
		{ parse_mode: 'HTML' }
	)
}
