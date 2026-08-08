// src/app/api/middlewares/validate-init-data.middleware.ts
import { createHmac, timingSafeEqual } from 'node:crypto'
import { UserRepository } from '../../../modules/user/user.repository'
import { config } from '../../../shared/configs/config'
import {
	InitDataExpiredError,
	InvalidInitDataError,
	TelegramUserNotFoundError
} from '../../../shared/errors/api.errors'

const INIT_DATA_MAX_AGE_SECONDS = 24 * 60 * 60

interface IValidatedInitData {
	userId: string
	telegramId: string
}

const userRepository = new UserRepository()

// Секрет зависит только от bot token — считаем один раз, не на каждый запрос
const secretKey = createHmac('sha256', 'WebAppData')
	.update(config.telegram.token)
	.digest()

export async function validateInitData(
	req: Request
): Promise<IValidatedInitData> {
	const rawInitData = req.headers.get('X-Init-Data')
	if (!rawInitData) {
		throw new InvalidInitDataError('Заголовок X-Init-Data отсутствует')
	}

	const params = new URLSearchParams(rawInitData)
	const hash = params.get('hash')
	if (!hash) throw new InvalidInitDataError('Отсутствует hash')
	params.delete('hash')

	const authDate = params.get('auth_date')
	if (!authDate) throw new InvalidInitDataError('Отсутствует auth_date')

	const ageSeconds = Math.floor(Date.now() / 1000) - Number(authDate)
	if (ageSeconds > INIT_DATA_MAX_AGE_SECONDS) throw new InitDataExpiredError()

	const dataCheckString = [...params.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, value]) => `${key}=${value}`)
		.join('\n')

	const computedHash = createHmac('sha256', secretKey)
		.update(dataCheckString)
		.digest('hex')

	if (!isHashValid(computedHash, hash)) {
		throw new InvalidInitDataError('Hash не совпадает')
	}

	const userRaw = params.get('user')
	if (!userRaw)
		throw new InvalidInitDataError('Отсутствуют данные пользователя')

	const telegramUser = JSON.parse(userRaw) as { id: number }
	const telegramId = String(telegramUser.id)

	const user = await userRepository.findByTelegramId(telegramId)
	if (!user) throw new TelegramUserNotFoundError()

	return { userId: user.id, telegramId }
}

function isHashValid(computed: string, received: string): boolean {
	const a = Buffer.from(computed, 'hex')
	const b = Buffer.from(received, 'hex')
	if (a.length !== b.length) return false
	return timingSafeEqual(a, b)
}
