import { z } from 'zod'
import {
	AiModelEnum,
	ResponseModeEnum,
	SettingsLanguageEnum,
	TemperatureEnum
} from '../../../../shared/constants/settings.constants'

export const settingsSchema = z.object({
	model: z.enum(AiModelEnum),
	language: z.enum(SettingsLanguageEnum),
	memoryEnabled: z.boolean(),
	responseMode: z.enum(ResponseModeEnum),
	temperature: z.union([
		z.literal(TemperatureEnum.Low),
		z.literal(TemperatureEnum.Default),
		z.literal(TemperatureEnum.High)
	])
})

export const updateSettingsSchema = settingsSchema.partial()

export type TSettingsResponse = z.infer<typeof settingsSchema>
export type TUpdateSettingsBody = z.infer<typeof updateSettingsSchema>
