import api from './axios'
import type { UserRankingItem } from './types/Ranking'

export const getAvailableCities = async (): Promise<string[]> => {
	const { data } = await api.get<string[]>('/rankings/cities')
	return data || []
}

export const getLocalUserRanking = async (
	city: string,
	limit: number = 20
): Promise<UserRankingItem[]> => {
	const { data } = await api.get<UserRankingItem[]>('/rankings/users/local', {
		params: { city, limit },
	})
	return data || []
}
