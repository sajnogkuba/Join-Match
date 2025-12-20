import api from './axios'
import type { UserRankingItem, TeamRankingItem, EventRankingItem, BadgeRankingItem } from './types/Ranking'

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

export const getActivityOrganizerRanking = async (
	limit: number = 20
): Promise<UserRankingItem[]> => {
	const { data } = await api.get<UserRankingItem[]>('/rankings/organizers/activity', {
		params: { limit },
	})
	return data || []
}

export const getLocalOrganizerRanking = async (
	city: string,
	limit: number = 20
): Promise<UserRankingItem[]> => {
	const { data } = await api.get<UserRankingItem[]>('/rankings/organizers/local', {
		params: { city, limit },
	})
	return data || []
}

export const getGeneralTeamRanking = async (
	limit: number = 20
): Promise<TeamRankingItem[]> => {
	const { data } = await api.get<TeamRankingItem[]>('/rankings/teams/general', {
		params: { limit },
	})
	return data || []
}

export const getLocalTeamRanking = async (
	city: string,
	limit: number = 20
): Promise<TeamRankingItem[]> => {
	const { data } = await api.get<TeamRankingItem[]>('/rankings/teams/local', {
		params: { city, limit },
	})
	return data || []
}

export const getAvailableTeamCities = async (): Promise<string[]> => {
	const { data } = await api.get<string[]>('/rankings/teams/cities')
	return data || []
}

export const getRatingEventRanking = async (
	limit: number = 20,
	minRatings: number = 1
): Promise<EventRankingItem[]> => {
	const { data } = await api.get<EventRankingItem[]>('/rankings/events/rating', {
		params: { limit, minRatings },
	})
	return data || []
}

export const getPopularityEventRanking = async (
	limit: number = 20
): Promise<EventRankingItem[]> => {
	const { data } = await api.get<EventRankingItem[]>('/rankings/events/popularity', {
		params: { limit },
	})
	return data || []
}

export const getLocalEventRanking = async (
	city: string,
	limit: number = 20,
	minRatings: number = 1
): Promise<EventRankingItem[]> => {
	const { data } = await api.get<EventRankingItem[]>('/rankings/events/local', {
		params: { city, limit, minRatings },
	})
	return data || []
}

export const getGeneralBadgeRanking = async (
	limit: number = 20
): Promise<BadgeRankingItem[]> => {
	const { data } = await api.get<BadgeRankingItem[]>('/rankings/badges/general', {
		params: { limit },
	})
	return data || []
}
