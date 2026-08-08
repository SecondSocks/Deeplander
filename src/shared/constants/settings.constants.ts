export const AiModelEnum = {
	Flash: 'deepseek-v4-flash',
	Pro: 'deepseek-v4-pro'
} as const
export type TAiModelEnum = (typeof AiModelEnum)[keyof typeof AiModelEnum]

export const SettingsLanguageEnum = {
	Ru: 'ru',
	En: 'en'
} as const
export type TSettingsLanguageEnum =
	(typeof SettingsLanguageEnum)[keyof typeof SettingsLanguageEnum]

export const ResponseModeEnum = {
	Short: 'short',
	Detailed: 'detailed'
} as const
export type TResponseModeEnum =
	(typeof ResponseModeEnum)[keyof typeof ResponseModeEnum]

export const TemperatureEnum = {
	Low: 0.3,
	Default: 0.7,
	High: 1.0
} as const
export type TTemperatureEnum =
	(typeof TemperatureEnum)[keyof typeof TemperatureEnum]

export const DEFAULT_USER_SETTINGS = {
	model: AiModelEnum.Flash,
	language: SettingsLanguageEnum.Ru,
	memoryEnabled: true,
	responseMode: ResponseModeEnum.Short,
	temperature: TemperatureEnum.Default
} as const
