import { onMessage } from '../bot/handlers/message.handler'
import { errorMiddleware } from '../bot/middlewares/error.middleware'
import { registerUserMiddleware } from '../bot/middlewares/register-user.middleware'
import { shutdown } from './shutdown'

import { prisma } from '../../prisma.service'
import { bot } from '../bot/bot'
import { onSettingsCallback } from '../bot/callbacks/settings.callback'
import { onHelpCommand } from '../bot/commands/help.command'
import { onNewCommand } from '../bot/commands/new.command'
import '../bot/commands/register-commands'
import { onSettingsCommand } from '../bot/commands/settings.command'
import { onStatsCommand } from '../bot/commands/stats.command'
import '../bot/handlers/message.handler'
import { logger } from '../infra/logger/logger.service'
import { RateLimitService } from '../modules/rate-limit/rate-limit.service'

const rateLimitService = new RateLimitService(prisma, logger)
setInterval(() => rateLimitService.cleanupExpired(), 60 * 60 * 1000)

bot.use(registerUserMiddleware)
bot.catch(errorMiddleware)

bot.command('new', onNewCommand)

bot.command('stats', onStatsCommand)

bot.command('settings', onSettingsCommand)
bot.callbackQuery(/^settings:/, onSettingsCallback)

bot.command('help', onHelpCommand)

bot.on('message:text', onMessage)

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
