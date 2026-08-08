export interface IRateLimitConfig {
	key: string
	userId: string
	maxCount: number
	windowMs: number
}

export interface IRateLimitResult {
	allowed: boolean
	remaining: number
	resetAt: Date
}

export interface ITokenLimitResult {
	allowed: boolean
	used: number
	limit: number
	resetAt: Date
}
