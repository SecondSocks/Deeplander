import './src/app/bootstrap'
import { bot } from './src/bot/bot'

await bot.start({
	onStart: botInfo => {
		console.log(`Bot started: @${botInfo.username}`)
	}
})
