import { InlineKeyboard } from 'grammy'
import type { UserSettings } from '../../generated/prisma/client'

export const buildSettingsKeyboard = (settings: Partial<UserSettings>) => {
	const model = settings.model ?? 'deepseek-v4-flash'
	const language = settings.language ?? 'ru'
	const memory = settings.memoryEnabled ?? true
	const mode = settings.responseMode ?? 'short'
	const temp = settings.temperature ?? 0.7

	return new InlineKeyboard()
		.text(
			`Модель: ${model === 'deepseek-v4-flash' ? '⚡ Flash' : '🧠 Pro'}`,
			`settings:model:${model === 'deepseek-v4-flash' ? 'deepseek-v4-pro' : 'deepseek-v4-flash'}`
		)
		.row()
		.text(
			`Язык: ${language === 'ru' ? '🇷🇺 RU' : '🇺🇸 EN'}`,
			`settings:language:${language === 'ru' ? 'en' : 'ru'}`
		)
		.row()
		.text(
			`Память: ${memory ? '✅ Вкл' : '❌ Выкл'}`,
			`settings:memory:${memory ? 'false' : 'true'}`
		)
		.row()
		.text(
			`Режим: ${mode === 'short' ? '📝 Кратко' : '📄 Подробно'}`,
			`settings:mode:${mode === 'short' ? 'detailed' : 'short'}`
		)
		.row()
		.text(
			`Температура: ${temp}`,
			`settings:temp:${temp === 0.3 ? '0.7' : temp === 0.7 ? '1.0' : '0.3'}`
		)
}
