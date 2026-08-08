import { InlineKeyboard } from 'grammy'
import type { UserSettings } from '../../generated/prisma/client'
import {
	AiModelEnum,
	ResponseModeEnum,
	SettingsLanguageEnum,
	TemperatureEnum
} from '../../shared/constants/settings.constants'

const modelLabel = (model: UserSettings['model']) =>
	model === AiModelEnum.Flash ? '⚡ Flash' : '🧠 Pro'

const languageLabel = (language: UserSettings['language']) =>
	language === SettingsLanguageEnum.Ru ? '🇷🇺 RU' : '🇺🇸 EN'

const temperatureLabel = (temp: UserSettings['temperature']) => {
	switch (temp) {
		case TemperatureEnum.Low:
			return '❄️ Низкая'
		case TemperatureEnum.High:
			return '🔥 Высокая'
		default:
			return '⚖️ Средняя'
	}
}

const nextTemperature = (temp: UserSettings['temperature']) =>
	temp === TemperatureEnum.Low
		? TemperatureEnum.Default
		: temp === TemperatureEnum.Default
			? TemperatureEnum.High
			: TemperatureEnum.Low

const toggleMark = (enabled: boolean) => (enabled ? '✅' : '❌')

export const buildSettingsKeyboard = (settings: Partial<UserSettings>) => {
	const model = settings.model ?? AiModelEnum.Flash
	const language = settings.language ?? SettingsLanguageEnum.Ru
	const memory = settings.memoryEnabled ?? true
	const mode = settings.responseMode ?? ResponseModeEnum.Short
	const temp = settings.temperature ?? TemperatureEnum.Default

	return new InlineKeyboard()
		.text(
			`🤖 Модель: ${modelLabel(model)}`,
			`settings:model:${model === AiModelEnum.Flash ? AiModelEnum.Pro : AiModelEnum.Flash}`
		)
		.row()
		.text(
			`🌐 Язык: ${languageLabel(language)}`,
			`settings:language:${language === SettingsLanguageEnum.Ru ? SettingsLanguageEnum.En : SettingsLanguageEnum.Ru}`
		)
		.row()
		.text(
			`🧠 Память: ${toggleMark(memory)}`,
			`settings:memory:${memory ? 'false' : 'true'}`
		)
		.row()
		.text(
			`📝 Режим: ${mode === ResponseModeEnum.Short ? 'Кратко' : 'Подробно'}`,
			`settings:mode:${mode === ResponseModeEnum.Short ? ResponseModeEnum.Detailed : ResponseModeEnum.Short}`
		)
		.row()
		.text(
			`🌡️ Температура: ${temperatureLabel(temp)}`,
			`settings:temp:${nextTemperature(temp)}`
		)
}
