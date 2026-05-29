import type { BotError } from 'grammy'
import { logger } from '../../infra/logger/logger.service'
import type { IBotContext } from '../../shared/types/bot-context.types'

export const errorMiddleware = async (error: BotError<IBotContext>) => {
	const ctx = error.ctx

	logger.error({
		message: error.message,
		updateId: ctx.update.update_id,
		userId: ctx.from?.id,
		chatId: ctx.chat?.id,
		error
	})

	try {
		await ctx.reply('Ошибка! Пожалуйста, попробуйте позже')
	} catch (replyError) {
		logger.error(replyError)
	}
}
