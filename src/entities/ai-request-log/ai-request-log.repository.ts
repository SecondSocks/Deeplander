import { prisma } from '../../../prisma.service'

interface ICreateAiRequestLogParams {
	userId: string
	conversationId: string
	provider: string
	inputTokens: number
	outputTokens: number
	latencyMs: number
	status: 'success' | 'error' | 'timeout' | 'cancelled'
	errorCode?: string
}

export class AiRequestLogRepository {
	async create(params: ICreateAiRequestLogParams) {
		return prisma.aiRequestLog.create({
			data: {
				userId: params.userId,
				conversationId: params.conversationId,
				provider: params.provider as any,
				inputTokens: params.inputTokens,
				outputTokens: params.outputTokens,
				latencyMs: params.latencyMs,
				status: params.status as any,
				errorCode: params.errorCode ?? null
			}
		})
	}
}
