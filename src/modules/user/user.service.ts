import { UserRepository } from './user.repository'

export class UserService {
	private readonly userRepository = new UserRepository()

	public async upsertTelegramUser(data: {
		telegramId: string

		username: string | null
		firstName: string | null
		lastName: string | null
		languageCode: string | null
	}) {
		return this.userRepository.upsert(data)
	}
}
