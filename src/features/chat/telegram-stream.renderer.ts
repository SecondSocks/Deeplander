import type { IBotContext } from '../../shared/types/bot-context.types'
import { markdownToHtml } from '../../shared/utils/markdown-to-html'

interface IRenderStreamParams {
	ctx: IBotContext
	stream: AsyncIterable<{
		content: string
		usage?: {
			promptTokens: number
			completionTokens: number
			totalTokens: number
		}
	}>
}

interface IRenderStreamResult {
	fullText: string
	usage?: {
		promptTokens: number
		completionTokens: number
		totalTokens: number
	}
}

export class TelegramStreamRenderer {
	public async render({
		ctx,
		stream
	}: IRenderStreamParams): Promise<IRenderStreamResult> {
		if (!ctx.chat) return { fullText: '' }

		const sentMessage = await ctx.reply('Печатает...')
		const telegramChatId = ctx.chat.id
		const telegramMessageId = sentMessage.message_id

		let fullText = ''
		let lastUpdateTime = 0
		let usage:
			| { promptTokens: number; completionTokens: number; totalTokens: number }
			| undefined

		for await (const chunk of stream) {
			if (chunk.usage) {
				usage = chunk.usage
				continue
			}

			fullText += chunk.content

			const now = Date.now()
			if (now - lastUpdateTime < 500) continue
			lastUpdateTime = now

			try {
				await ctx.api.editMessageText(
					telegramChatId,
					telegramMessageId,
					fullText
				)
			} catch {}
		}

		try {
			await ctx.api.editMessageText(
				telegramChatId,
				telegramMessageId,
				markdownToHtml(fullText),
				{ parse_mode: 'HTML' }
			)
		} catch {}

		return { fullText, usage }
	}
}
