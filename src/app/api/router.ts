import { logger } from '../../infra/logger/logger.service'
import {
	InitDataExpiredError,
	InvalidInitDataError,
	TelegramUserNotFoundError
} from '../../shared/errors/api.errors'
import { validateInitData } from './middlewares/validate-init-data.middleware'
import {
	handleGetSettings,
	handlePutSettings
} from './mini-app/settings/settings.route'
import { handleGetUsage } from './mini-app/usage/usage.route'

export async function apiRouter(req: Request): Promise<Response> {
	const url = new URL(req.url)

	if (url.pathname === '/health') return new Response('OK', { status: 200 })

	if (!url.pathname.startsWith('/api/mini-app'))
		return new Response('Not Found', { status: 404 })

	const authResult = await validateInitData(req)
	try {
		const { userId } = await validateInitData(req)
		if (url.pathname === '/api/mini-app/usage' && req.method === 'GET')
			return handleGetUsage(userId)

		if (url.pathname === '/api/mini-app/settings') {
			if (req.method === 'GET') return handleGetSettings(userId)
			if (req.method === 'PUT') return handlePutSettings(userId, req)
		}
	} catch (error) {
		if (
			error instanceof InvalidInitDataError ||
			error instanceof InitDataExpiredError
		) {
			return Response.json({ error: error.message }, { status: 401 })
		}
		if (error instanceof TelegramUserNotFoundError) {
			return Response.json({ error: error.message }, { status: 404 })
		}
		logger.error(error)
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}

	return new Response('Not Found', { status: 404 })
}
