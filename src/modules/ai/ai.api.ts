import { OpenAI } from 'openai'
import { config } from '../../shared/configs/config'

export const deepseek = new OpenAI({
	baseURL: config.api.url,
	apiKey: config.api.key
})
