import { ConversationRepository } from '../../entities/conversation/conversation.repository'
import { logger } from '../../infra/logger/logger.service'
import type { IBotContext } from '../../shared/types/bot-context.types'

const conversationRepository = new ConversationRepository()

export const onNewCommand = async (ctx: IBotContext) => {
	if (!ctx.user || !ctx.chatEntity) return

	try {
		await conversationRepository.deactivateActiveConversation(
			ctx.user.id,
			ctx.chatEntity.id
		)
		await conversationRepository.create({
			userId: ctx.user.id,
			chatId: ctx.chatEntity.id
		})
		await ctx.reply('Начат новый диалог. Чего тебе?')
	} catch (error) {
		logger.error(error)
		await ctx.reply(
			'Что-то пошло не так при создании нового диалога. Попробуй еще раз.'
		)
	}
}
