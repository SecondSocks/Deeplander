import { prisma } from '../../../prisma.service'
import type { TRole } from '../../shared/types/ai.types'

interface ICreateMessageParams {
	conversationId: string
	role: TRole
	content: string

	provider?: string
	model?: string
}

export class MessageRepository {
	async create({
		conversationId,
		role,
		content,
		provider,
		model
	}: ICreateMessageParams) {
		return prisma.message.create({
			data: {
				conversationId,
				role,
				content,
				provider,
				model
			}
		})
	}

	async findByConversationId(conversationId: string) {
		return prisma.message.findMany({
			where: {
				conversationId
			},
			orderBy: {
				createdAt: 'asc'
			}
		})
	}

	async findLastN(conversationId: string, n: number) {
		return prisma.message
			.findMany({
				where: { conversationId },
				orderBy: { createdAt: 'desc' },
				take: n
			})
			.then(msgs => msgs.reverse())
	}

	async countByConversationId(conversationId: string) {
		return prisma.message.count({ where: { conversationId } })
	}
}
