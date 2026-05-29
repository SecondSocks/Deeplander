import OpenAI from 'openai'
import { logger } from '../../../infra/logger/logger.service'
import { config } from '../../../shared/configs/config'
import {
	AIProviderError,
	AITimeoutError
} from '../../../shared/errors/ai.errors'
import type {
	IGenerateTextParams,
	IGenerateTextResponse
} from '../../../shared/types/ai.types'
import type { IAIProvider } from '../ai.types'

const client = new OpenAI({
	baseURL: config.api.url,

	apiKey: config.api.key
})

export class DeepseekProvider implements IAIProvider {
	public async generateText({
		messages,
		model = config.api.model.flash,
		temperature = 0.7,
		maxTokens = 2048
	}: IGenerateTextParams): Promise<IGenerateTextResponse> {
		const controller = new AbortController()

		const timeout = setTimeout(() => {
			controller.abort()
		}, 30_000)

		try {
			const response = await client.chat.completions.create(
				{
					model,
					messages,
					temperature,
					max_tokens: maxTokens
				},
				{
					signal: controller.signal
				}
			)

			return {
				content: response.choices[0]?.message.content ?? '',
				provider: 'deepseek',
				model,
				finishReason: response.choices[0]?.finish_reason ?? undefined,
				usage: response.usage
					? {
							promptTokens: response.usage.prompt_tokens,
							completionTokens: response.usage.completion_tokens,
							totalTokens: response.usage.total_tokens
						}
					: undefined
			}
		} catch (error) {
			if (controller.signal.aborted) {
				throw new AITimeoutError()
			}

			logger.error(
				`DeepseekProvider error: ${error instanceof Error ? error.message : 'Unknown error'}`
			)

			throw new AIProviderError(
				error instanceof Error ? error.message : 'Unknown AI provider error'
			)
		} finally {
			clearTimeout(timeout)
		}
	}

	// в streamText, измени тип yield и добавь stream_options
	public async *streamText({
		messages,
		model = config.api.model.flash,
		temperature = 0.7,
		maxTokens = 2048
	}: IGenerateTextParams) {
		const stream = await client.chat.completions.create({
			model,
			messages,
			stream: true,
			temperature,
			max_tokens: maxTokens,
			stream_options: { include_usage: true } // ← добавь
		})

		let usage:
			| { promptTokens: number; completionTokens: number; totalTokens: number }
			| undefined

		for await (const chunk of stream) {
			const content = chunk.choices[0]?.delta?.content
			if (content) yield { content, usage: undefined }

			if (chunk.usage) {
				usage = {
					promptTokens: chunk.usage.prompt_tokens,
					completionTokens: chunk.usage.completion_tokens,
					totalTokens: chunk.usage.total_tokens
				}
			}
		}

		// финальный yield только с usage
		if (usage) yield { content: '', usage }
	}
}
