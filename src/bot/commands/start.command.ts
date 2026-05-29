import { bot } from '../bot'
import { mainKeyboard } from '../keyboards/main.keyboard'

bot.command('start', async ctx => {
	const firstName = ctx.user?.firstName ?? 'ты'

	await ctx.reply(
		[
			`Патриот слушает, ${firstName}!`,
			'',
			'Я сын Deepseek.',
			'',
			'Ты можешь спросить меня о чем угодно.',
			'',
			'Доступные команды:',
			'/new — начать новую беседу',
			'/settings — показать настройки',
			'/help — вспомогательная информация'
		].join('\n'),
		{
			reply_markup: mainKeyboard
		}
	)
})
