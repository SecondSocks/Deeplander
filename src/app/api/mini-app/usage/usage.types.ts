interface IUsageWindow {
	used: number
	limit: number
	resetAt: Date
}

export interface IUsageResponse {
	today: {
		requests: number
		totalTokens: number
	}
	day: IUsageWindow | null
	week: IUsageWindow | null
	month: IUsageWindow | null
}
