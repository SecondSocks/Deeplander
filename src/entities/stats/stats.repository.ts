import { prisma } from '../../../prisma.service'

export class StatsRepository {
	public async getTodayStats(userId: string) {
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		const logs = await prisma.aiRequestLog.aggregate({
			where: {
				userId,
				status: 'success',
				createdAt: { gte: today }
			},
			_count: { id: true },
			_sum: {
				inputTokens: true,
				outputTokens: true
			}
		})

		return {
			requests: logs._count.id,
			totalTokens: (logs._sum.inputTokens ?? 0) + (logs._sum.outputTokens ?? 0)
		}
	}
}
