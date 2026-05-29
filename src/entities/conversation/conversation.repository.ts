import { prisma } from '../../../prisma.service'
import { config } from '../../shared/configs/config'

export class ConversationRepository {
	public async findById(id: string) {
		return prisma.conversation.findUnique({
			where: { id }
		})
	}

	public async findByUserAndChat(userId: string, chatId: string) {
		return prisma.conversation.findFirst({
			where: {
				userId,
				chatId,
				isActive: true
			}
		})
	}

	public async create(params: { userId: string; chatId: string }) {
		return prisma.conversation.create({
			data: {
				userId: params.userId,
				chatId: params.chatId,
				defaultProvider: 'deepseek',
				defaultModel: config.api.model.flash,
				isActive: true
			}
		})
	}

	public async findOrCreate(userId: string, chatId: string) {
		const existingConversation = await this.findByUserAndChat(userId, chatId)

		if (existingConversation) {
			return existingConversation
		}

		return this.create({
			userId,
			chatId
		})
	}

	public async deactivateActiveConversation(userId: string, chatId: string) {
		return prisma.conversation.updateMany({
			where: {
				userId,
				chatId,
				isActive: true
			},

			data: {
				isActive: false
			}
		})
	}

	async updateSummary(conversationId: string, summary: string) {
		return prisma.conversation.update({
			where: { id: conversationId },
			data: { summary }
		})
	}
}
