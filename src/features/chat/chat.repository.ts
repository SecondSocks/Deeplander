import { prisma } from '../../../prisma.service'
import type { ChatType } from '../../generated/prisma/client'

export class ChatRepository {
	public async upsert(data: {
		telegramChatId: string

		type: ChatType

		title: string | null

		ownerId: string
	}) {
		return prisma.chat.upsert({
			where: {
				telegramChatId: data.telegramChatId
			},

			create: {
				telegramChatId: data.telegramChatId,

				type: data.type,

				title: data.title,

				ownerId: data.ownerId
			},

			update: {
				type: data.type,

				title: data.title
			}
		})
	}
}
