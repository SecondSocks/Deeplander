import type { Context } from 'grammy'
import type { Chat } from '../../generated/prisma/client'
import type { IUserEntity } from './user.types'

export interface IBotContext extends Context {
	user?: IUserEntity
	chatEntity?: Chat
}
