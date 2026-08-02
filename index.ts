import './src/app/bootstrap'
import { bot } from './src/bot/bot'

const port = Number(process.env.PORT ?? 8080)

Bun.serve({
	port,
	hostname: '0.0.0.0',
	fetch() {
		return new Response('OK')
	}
})

await bot.start({
	onStart: botInfo => {
		console.log(`Bot started: @${botInfo.username}`)
	}
})
