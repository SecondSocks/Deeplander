import { SettingsRepository } from '../../../../entities/settings/settings.repository'
import { DEFAULT_USER_SETTINGS } from '../../../../shared/constants/settings.constants'
import { InvalidRequestBodyError } from '../../../../shared/errors/api.errors'
import { settingsSchema, updateSettingsSchema } from './settings.schema'

const settingsRepository = new SettingsRepository()

export async function handleGetSettings(userId: string): Promise<Response> {
	const settings = await settingsRepository.findByUserId(userId)

	return Response.json(
		settingsSchema.parse(settings ?? DEFAULT_USER_SETTINGS),
		{ status: 200 }
	)
}

export async function handlePutSettings(
	userId: string,
	req: Request
): Promise<Response> {
	const body = await req.json().catch(() => {
		throw new InvalidRequestBodyError('Invalid JSON body')
	})

	const parsed = updateSettingsSchema.safeParse(body)
	if (!parsed.success) throw new InvalidRequestBodyError(parsed.error.message)

	const updated = await settingsRepository.upsert(userId, parsed.data)

	return Response.json(settingsSchema.parse(updated), { status: 200 })
}
