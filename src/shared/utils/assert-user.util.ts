import type { IBotContext } from '../types/bot-context.types'

export function assertUser(
	ctx: IBotContext
): asserts ctx is IBotContext & { user: NonNullable<IBotContext['user']> } {
	if (!ctx.user) throw new Error('Пользователь не найден')
}
