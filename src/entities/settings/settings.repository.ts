import { prisma } from '../../../prisma.service'

export class SettingsRepository {
	public async findByUserId(userId: string) {
		return prisma.userSettings.findUnique({ where: { userId } })
	}

	public async upsert(
		userId: string,
		data: Partial<{
			model: string
			language: string
			memoryEnabled: boolean
			responseMode: string
			temperature: number
		}>
	) {
		return prisma.userSettings.upsert({
			where: { userId },
			create: {
				userId,
				model: 'deepseek-v4-flash',
				language: 'ru',
				memoryEnabled: true,
				responseMode: 'short',
				temperature: 0.7,
				...data // перезапишет дефолты если есть
			},
			update: data
		})
	}
}
