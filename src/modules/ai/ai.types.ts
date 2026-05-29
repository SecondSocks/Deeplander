import type {
	IAIStreamChunk,
	IGenerateTextParams,
	IGenerateTextResponse
} from '../../shared/types/ai.types'

export interface IAIProvider {
	generateText(params: IGenerateTextParams): Promise<IGenerateTextResponse>

	streamText?(params: IGenerateTextParams): AsyncIterable<IAIStreamChunk>
}
