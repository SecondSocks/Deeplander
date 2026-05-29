export const UserStatusEnum = {
	Active: 'active',
	Blocked: 'blocked',
	Pending: 'pending'
} as const
export type TUserStatus = (typeof UserStatusEnum)[keyof typeof UserStatusEnum]

export interface IUserEntity {
	id: string

	telegramId: string

	username: string | null
	firstName: string | null
	lastName: string | null
	languageCode: string | null

	status: TUserStatus

	createdAt: Date
	updatedAt: Date
}
