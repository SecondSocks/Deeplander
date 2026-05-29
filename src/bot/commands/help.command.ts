import type { IBotContext } from '../../shared/types/bot-context.types'

export const onHelpCommand = async (ctx: IBotContext) => {
	await ctx.reply(
		[
			'Возможности:',
			'• AI беседы',
			'• Streaming ответы',
			'• Multi-message контекст',
			'',
			'Текущие лимиты:',
			'• MVP работает только в приватных чатах',
			'• Нет поддержки файлов/фотографий',
			'• Нет поддержки голосовых сообщений'
		].join('\n')
	)
}
