import { Bot } from 'grammy'
import { env } from '../app/env'
import type { IBotContext } from '../shared/types/bot-context.types'

export const bot = new Bot<IBotContext>(env.BOT_TOKEN)
