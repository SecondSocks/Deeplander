import { SettingsRepository } from '../../entities/settings/settings.repository'
import type { IBotContext } from '../../shared/types/bot-context.types'
import { buildSettingsKeyboard } from '../keyboards/settings.keyboards'

const settingsRepository = new SettingsRepository()

export const onSettingsCommand = async (ctx: IBotContext) => {
	if (!ctx.user) return

	const settings = await settingsRepository.findByUserId(ctx.user.id)

	await ctx.reply('⚙️ Настройки:', {
		reply_markup: buildSettingsKeyboard(settings ?? {})
	})
}
