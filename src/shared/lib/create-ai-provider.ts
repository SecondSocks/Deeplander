import { DeepseekProvider } from '../../modules/ai/providers/deepseek.provider'

export function createAIProvider() {
	return new DeepseekProvider()
}
