export class AIProviderError extends Error {
	constructor(message: string) {
		super(message)

		this.name = 'AIProviderError'
	}
}

export class AITimeoutError extends Error {
	constructor() {
		super('AI request timeout')

		this.name = 'AITimeoutError'
	}
}
