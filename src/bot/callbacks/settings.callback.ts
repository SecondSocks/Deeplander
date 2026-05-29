import { SettingsRepository } from '../../entities/settings/settings.repository'
import type { IBotContext } from '../../shared/types/bot-context.types'
import { buildSettingsKeyboard } from '../keyboards/settings.keyboards'

const settingsRepository = new SettingsRepository()

export const onSettingsCallback = async (ctx: IBotContext) => {
	if (!ctx.user || !ctx.callbackQuery?.data) return

	const parts = ctx.callbackQuery.data.split(':')
	const field = parts[1]
	const value = parts[2]

	if (!field || !value) return

	const updateMap: Record<string, Record<string, unknown>> = {
		model: { model: value },
		language: { language: value },
		memory: { memoryEnabled: value === 'true' },
		mode: { responseMode: value },
		temp: { temperature: parseFloat(value) }
	}

	const update = updateMap[field]
	if (!update) return

	const updated = await settingsRepository.upsert(ctx.user.id, update)

	await ctx.editMessageReplyMarkup({
		reply_markup: buildSettingsKeyboard(updated)
	})

	await ctx.answerCallbackQuery()
}
