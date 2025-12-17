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

export const getGeneralOrganizerRanking = async (
	limit: number = 20,
	minRatings: number = 1
): Promise<UserRankingItem[]> => {
	const { data } = await api.get<UserRankingItem[]>('/rankings/organizers/general', {
		params: { limit, minRatings },
	})
	return data || []
}
