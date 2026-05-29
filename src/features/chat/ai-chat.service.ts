import { ConversationRepository } from '../../entities/conversation/conversation.repository'
import { MessageRepository } from '../../entities/message/message.repository'
import { SettingsRepository } from '../../entities/settings/settings.repository'
import type { IAIProvider } from '../../modules/ai/ai.types'
import { config } from '../../shared/configs/config'
import type { IMessage } from '../../shared/types/ai.types'
import { buildSummaryPrompt, buildSystemPrompt } from './chat.prompts'
import type { ISendMessageArgs } from './chat.types'

const HISTORY_LIMIT = 12
const SUMMARY_EVERY_N = 10

export class AiChatService {
	private conversationRepository = new ConversationRepository()
	private messageRepository = new MessageRepository()
	private settingsRepository = new SettingsRepository()

	constructor(private readonly provider: IAIProvider) {}

	private async buildMessages(conversationId: string): Promise<IMessage[]> {
		const [conversation, history] = await Promise.all([
			this.conversationRepository.findById(conversationId),
			this.messageRepository.findLastN(conversationId, HISTORY_LIMIT)
		])

		const messages: IMessage[] = [
			{ role: 'system', content: buildSystemPrompt() }
		]

		if (conversation?.summary) {
			messages.push({
				role: 'system',
				content: `Conversation summary so far:\n${conversation.summary}`
			})
		}

		for (const msg of history) {
			messages.push({
				role: msg.role as IMessage['role'],
				content: msg.content
			})
		}

		return messages
	}

	private async maybeSummarize(conversationId: string): Promise<void> {
		const count =
			await this.messageRepository.countByConversationId(conversationId)

		if (count % SUMMARY_EVERY_N !== 0) return

		const history = await this.messageRepository.findLastN(
			conversationId,
			SUMMARY_EVERY_N
		)
		const prompt = buildSummaryPrompt(
			history.map(m => ({
				role: m.role as IMessage['role'],
				content: m.content
			}))
		)

		const response = await this.provider.generateText({
			messages: [{ role: 'user', content: prompt }]
		})

		await this.conversationRepository.updateSummary(
			conversationId,
			response.content
		)
	}

	async sendMessage({ userId, chatId, content }: ISendMessageArgs) {
		const [conversation, settings] = await Promise.all([
			this.conversationRepository.findOrCreate(userId, chatId),
			this.settingsRepository.findByUserId(userId)
		])

		const model = settings?.model ?? config.api.model.flash

		await this.messageRepository.create({
			conversationId: conversation.id,
			role: 'user',
			content
		})

		const messages = await this.buildMessages(conversation.id)

		const response = await this.provider.generateText({ messages, model })

		await this.messageRepository.create({
			conversationId: conversation.id,
			role: 'assistant',
			content: response.content,
			provider: 'deepseek',
			model
		})

		this.maybeSummarize(conversation.id).catch(() => null)

		return response
	}

	async streamMessage({ userId, chatId, content }: ISendMessageArgs) {
		const [conversation, settings] = await Promise.all([
			this.conversationRepository.findOrCreate(userId, chatId),
			this.settingsRepository.findByUserId(userId)
		])

		const model = settings?.model ?? config.api.model.flash

		await this.messageRepository.create({
			conversationId: conversation.id,
			role: 'user',
			content
		})

		const messages = await this.buildMessages(conversation.id)
		const stream = this.provider.streamText?.({ messages, model })

		if (!stream) throw new Error('Streaming is not supported')

		return { conversationId: conversation.id, stream }
	}

	async saveAssistantMessage({
		conversationId,
		content
	}: {
		conversationId: string
		content: string
	}) {
		const message = await this.messageRepository.create({
			conversationId,
			role: 'assistant',
			content
		})

		this.maybeSummarize(conversationId).catch(() => null)

		return message
	}
}
