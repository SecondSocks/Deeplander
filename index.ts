import { apiRouter } from './src/app/api/router'

const port = Number(process.env.PORT ?? 8080)

Bun.serve({
	port,
	hostname: '0.0.0.0',
	fetch: req => apiRouter(req)
})

const migration = Bun.spawn(['bunx', 'prisma', 'migrate', 'deploy'], {
	stdout: 'inherit',
	stderr: 'inherit'
})

const migrationExitCode = await migration.exited

if (migrationExitCode !== 0) {
	console.error(`Prisma migrations failed with exit code ${migrationExitCode}`)
	process.exit(migrationExitCode)
}

await import('./src/app/bootstrap')

const { bot } = await import('./src/bot/bot')

await bot.start({
	onStart: botInfo => {
		console.log(`Bot started: @${botInfo.username}`)
	}
})
