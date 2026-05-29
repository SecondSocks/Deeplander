import type { ChatType } from '../../generated/prisma/browser'
import { ChatRepository } from './chat.repository'

export class ChatService {
	private readonly chatRepository = new ChatRepository()

	public async upsertTelegramChat(data: {
		telegramChatId: string

		type: ChatType

		title: string | null

		ownerId: string
	}) {
		return this.chatRepository.upsert(data)
	}
}
