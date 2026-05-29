export const AiProviderEnum = {
	Deepseek: 'deepseek',
	OpenAI: 'openai',
	Anthropic: 'anthropic'
} as const

export type TAiProvider = (typeof AiProviderEnum)[keyof typeof AiProviderEnum]

export type TRole = 'system' | 'user' | 'assistant'

export interface IMessage {
	role: TRole
	content: string
}

export interface IGenerateTextParams {
	messages: IMessage[]
	model?: string
	temperature?: number
	maxTokens?: number
}

export interface ITokenUsage {
	promptTokens: number
	completionTokens: number
	totalTokens: number
}

export interface IGenerateTextResponse {
	content: string
	provider: TAiProvider
	model: string
	usage?: ITokenUsage
	finishReason?: string
}

export interface IAIStreamChunk {
	content: string
	isFinished?: boolean
	finishReason?: string
}
