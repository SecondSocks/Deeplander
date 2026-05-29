import { PrismaPg } from '@prisma/adapter-pg'
import { env } from './src/app/env'
import { PrismaClient } from './src/generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
	prisma?: PrismaClient
}

const adapter = new PrismaPg({
	connectionString: env.DATABASE_URL
})

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log: ['error', 'warn']
	})

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma
}
