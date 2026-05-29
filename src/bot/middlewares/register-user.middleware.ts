import type { MiddlewareFn } from 'grammy'
import { ChatService } from '../../features/chat/chat.service'
import { UserService } from '../../modules/user/user.service'
import type { IBotContext } from '../../shared/types/bot-context.types'

const userService = new UserService()

const chatService = new ChatService()

export const registerUserMiddleware: MiddlewareFn<IBotContext> = async (
	ctx,
	next
) => {
	const from = ctx.from
	const chat = ctx.chat

	if (!from || !chat) {
		return next()
	}

	// MVP: only private chats

	if (chat.type !== 'private') {
		return ctx.reply('MVP version currently works only in private chats.')
	}

	const user = await userService.upsertTelegramUser({
		telegramId: String(from.id),

		username: from.username ?? null,
		firstName: from.first_name ?? null,
		lastName: from.last_name ?? null,
		languageCode: from.language_code ?? null
	})

	const chatEntity = await chatService.upsertTelegramChat({
		telegramChatId: String(chat.id),

		type: chat.type,

		title: null,

		ownerId: user.id
	})

	ctx.user = user

	ctx.chatEntity = chatEntity

	return next()
}
