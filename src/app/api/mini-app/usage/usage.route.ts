import { prisma } from '../../../../../prisma.service'
import { StatsRepository } from '../../../../entities/stats/stats.repository'
import { logger } from '../../../../infra/logger/logger.service'
import { RateLimitService } from '../../../../modules/rate-limit/rate-limit.service'
import type { IUsageResponse } from './usage.types'

const rateLimitService = new RateLimitService(prisma, logger)
const statsRepository = new StatsRepository()

export async function handleGetUsage(userId: string): Promise<Response> {
	const [todayStats, tokenStats] = await Promise.all([
		statsRepository.getTodayStats(userId),
		rateLimitService.getTokenStats(userId)
	])

	const response: IUsageResponse = {
		today: todayStats,
		day: tokenStats.day,
		week: tokenStats.week,
		month: tokenStats.month
	}

	return Response.json(response, { status: 200 })
}
