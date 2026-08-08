export class InvalidInitDataError extends Error {
	constructor(message = 'Invalid auth data') {
		super(message)
		this.name = 'InvalidInitDataError'
	}
}

export class InitDataExpiredError extends Error {
	constructor() {
		super('Auth data has expired')
		this.name = 'InitDataExpiredError'
	}
}

export class TelegramUserNotFoundError extends Error {
	constructor() {
		super('User is not registered in the bot')
		this.name = 'TelegramUserNotFoundError'
	}
}

export class InvalidRequestBodyError extends Error {
	constructor(message = 'Invalid request body') {
		super(message)
		this.name = 'InvalidRequestBodyError'
	}
}
