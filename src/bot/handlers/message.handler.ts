import { prisma } from '../../../prisma.service'
import { AiRequestLogRepository } from '../../entities/ai-request-log/ai-request-log.repository'
import { AiChatService } from '../../features/chat/ai-chat.service'
import { TelegramStreamRenderer } from '../../features/chat/telegram-stream.renderer'
import { logger } from '../../infra/logger/logger.service'
import { RateLimitService } from '../../modules/rate-limit/rate-limit.service'
import { createAIProvider } from '../../shared/lib/create-ai-provider'
import type { IBotContext } from '../../shared/types/bot-context.types'

const provider = createAIProvider()
const chatService = new AiChatService(provider)

const rateLimitService = new RateLimitService(prisma, logger)

const renderer = new TelegramStreamRenderer()

const aiRequestLogRepository = new AiRequestLogRepository()

export const onMessage = async (ctx: IBotContext) => {
	const text = ctx.message?.text
	if (!text || !ctx.user || !ctx.chatEntity) return

	await ctx.replyWithChatAction('typing')

	const startedAt = Date.now()

	const result = await chatService.streamMessage({
		userId: ctx.user.id,
		chatId: ctx.chatEntity.id,
		content: text
	})

	const { fullText, usage } = await renderer.render({
		ctx,
		stream: result.stream
	})

	const totalTokens =
		(usage?.promptTokens ?? 0) + (usage?.completionTokens ?? 0)
	if (totalTokens > 0) {
		const tokenResult = await rateLimitService.checkAndConsumeTokens(
			ctx.user.id,
			totalTokens
		)

		if (!tokenResult.allowed) {
			const hours = Math.ceil(
				(tokenResult.resetAt.getTime() - Date.now()) / 3_600_000
			)
			await ctx.reply(
				`Дневной лимит токенов исчерпан (${tokenResult.used.toLocaleString()} / ${tokenResult.limit.toLocaleString()}). Сбросится через ~${hours} ч.`
			)
			// Сообщение всё равно сохраняем — пользователь его уже увидел
			await chatService.saveAssistantMessage({
				conversationId: result.conversationId,
				content: fullText
			})
			return
		}
	}

	await chatService.saveAssistantMessage({
		conversationId: result.conversationId,
		content: fullText
	})

	// fire-and-forget
	aiRequestLogRepository
		.create({
			userId: ctx.user.id,
			conversationId: result.conversationId,
			provider: 'deepseek',
			inputTokens: usage?.promptTokens ?? 0,
			outputTokens: usage?.completionTokens ?? 0,
			latencyMs: Date.now() - startedAt,
			status: 'success'
		})
		.catch(() => null)
}
