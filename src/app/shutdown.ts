import { prisma } from '../../prisma.service'
import { bot } from '../bot/bot'

export async function shutdown() {
	try {
		await bot.stop()
	} catch {
		// grammY can reject the polling delay during signal-based shutdown.
	} finally {
		await prisma.$disconnect()
	}
}
