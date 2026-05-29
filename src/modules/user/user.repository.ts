import { prisma } from '../../../prisma.service'

export class UserRepository {
	public async upsert(data: {
		telegramId: string

		username: string | null
		firstName: string | null
		lastName: string | null
		languageCode: string | null
	}) {
		return prisma.user.upsert({
			where: {
				telegramId: data.telegramId
			},

			create: {
				telegramId: data.telegramId,

				username: data.username,
				firstName: data.firstName,
				lastName: data.lastName,
				languageCode: data.languageCode
			},

			update: {
				username: data.username,
				firstName: data.firstName,
				lastName: data.lastName,
				languageCode: data.languageCode
			}
		})
	}
}
