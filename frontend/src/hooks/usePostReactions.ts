import { useCallback } from 'react'
import api from '../Api/axios'
import type { TeamPostReactionRequestDto, TeamPostReactionResponseDto } from '../Api/types/TeamPost'

export const usePostReactions = () => {
	const getUserReaction = useCallback(async (postId: number, userId: number): Promise<number | null> => {
		try {
			const response = await api.get(`/reaction/team-post/${postId}`, {
				params: { page: 0, size: 100 }
			})
			
			const pageData = response.data
			const reactions = pageData?.content || []
			
			if (reactions.length === 0) {
				return null
			}
			
			const userReaction = reactions.find(
				(reaction: TeamPostReactionResponseDto) => reaction.userId === userId
			)
			
			return userReaction?.reactionType?.id || null
		} catch (error: any) {
			if (error.response?.status === 204) {
				return null
			}
			return null
		}
	}, [])

	const addOrUpdateReaction = useCallback(async (
		postId: number,
		userId: number,
		reactionTypeId: number,
		currentReactionCounts?: Record<number, number>,
		previousUserReactionTypeId?: number | null
	): Promise<Record<number, number> | null> => {
		try {
			const existingReactionTypeId = await getUserReaction(postId, userId)
			
			const requestDto: TeamPostReactionRequestDto = {
				userId,
				postId,
				reactionTypeId,
			}
			
			if (existingReactionTypeId !== null) {
				await api.patch<TeamPostReactionResponseDto>(
					'/reaction/team-post',
					requestDto
				).then(res => res.data)
			} else {
				try {
					await api.post<TeamPostReactionResponseDto>(
						'/reaction/team-post',
						requestDto
					).then(res => res.data)
				} catch (postError: any) {
					const errorMessage = postError.response?.data?.message || ''
					if (errorMessage.includes('duplicate key') || errorMessage.includes('unique_post_reaction')) {
						await api.patch<TeamPostReactionResponseDto>(
							'/reaction/team-post',
							requestDto
						).then(res => res.data)
					} else {
						throw postError
					}
				}
			}

			try {
				const reactionsResponse = await api.get(`/reaction/team-post/${postId}`, {
					params: { page: 0, size: 100 }
				})

				const pageData = reactionsResponse.data
				const reactions = pageData?.content || []
				
				if (reactions.length === 0) {
					const counts: Record<number, number> = currentReactionCounts ? { ...currentReactionCounts } : {}
					
					const prevReactionId = previousUserReactionTypeId || existingReactionTypeId
					if (prevReactionId !== null && prevReactionId !== undefined && counts[prevReactionId]) {
						counts[prevReactionId] = Math.max(0, counts[prevReactionId] - 1)
						if (counts[prevReactionId] === 0) {
							delete counts[prevReactionId]
						}
					}
					
					counts[reactionTypeId] = (counts[reactionTypeId] || 0) + 1
					
					return counts
				}
				
				const counts: Record<number, number> = {}
				
				reactions.forEach((reaction: TeamPostReactionResponseDto) => {
					const typeId = reaction.reactionType?.id
					if (typeId) {
						counts[typeId] = (counts[typeId] || 0) + 1
					}
				})

				return counts
			} catch (error: any) {
				if (error.response?.status === 204) {
					const counts: Record<number, number> = currentReactionCounts ? { ...currentReactionCounts } : {}
					
					const prevReactionId = previousUserReactionTypeId || existingReactionTypeId
					if (prevReactionId !== null && prevReactionId !== undefined && counts[prevReactionId]) {
						counts[prevReactionId] = Math.max(0, counts[prevReactionId] - 1)
						if (counts[prevReactionId] === 0) {
							delete counts[prevReactionId]
						}
					}
					
					counts[reactionTypeId] = (counts[reactionTypeId] || 0) + 1
					
					return counts
				}
				throw error
			}
		} catch (error) {
			return null
		}
	}, [getUserReaction])

	const deleteReaction = useCallback(async (
		postId: number,
		userId: number,
		currentReactionCounts?: Record<number, number>,
		reactionTypeId?: number | null
	): Promise<Record<number, number> | null> => {
		try {
			const requestDto: TeamPostReactionRequestDto = {
				userId,
				postId,
				reactionTypeId: reactionTypeId || 0,
			}

			await api.delete('/reaction/team-post', {
				data: requestDto
			})

			try {
				const reactionsResponse = await api.get(`/reaction/team-post/${postId}`, {
					params: { page: 0, size: 100 }
				})

				const pageData = reactionsResponse.data
				const reactions = pageData?.content || []
				
				if (reactions.length === 0) {
					const counts: Record<number, number> = currentReactionCounts ? { ...currentReactionCounts } : {}
					
					if (reactionTypeId !== null && reactionTypeId !== undefined && counts[reactionTypeId]) {
						counts[reactionTypeId] = Math.max(0, counts[reactionTypeId] - 1)
						if (counts[reactionTypeId] === 0) {
							delete counts[reactionTypeId]
						}
					}
					
					return counts
				}
				
				const counts: Record<number, number> = {}
				
				reactions.forEach((reaction: TeamPostReactionResponseDto) => {
					const typeId = reaction.reactionType?.id
					if (typeId) {
						counts[typeId] = (counts[typeId] || 0) + 1
					}
				})

				return counts
			} catch (error: any) {
				if (error.response?.status === 204) {
					const counts: Record<number, number> = currentReactionCounts ? { ...currentReactionCounts } : {}
					
					if (reactionTypeId !== null && reactionTypeId !== undefined && counts[reactionTypeId]) {
						counts[reactionTypeId] = Math.max(0, counts[reactionTypeId] - 1)
						if (counts[reactionTypeId] === 0) {
							delete counts[reactionTypeId]
						}
					}
					
					return counts
				}
				throw error
			}
		} catch (error) {
			return null
		}
	}, [])

	const getReactionUsers = useCallback(async (
		postId: number,
		reactionTypeId: number
	): Promise<Array<{ userId: number; name: string; avatarUrl: string | null }>> => {
		try {
			const response = await api.get(`/reaction/team-post/${postId}`, {
				params: { page: 0, size: 100 }
			})
			
			const pageData = response.data
			const reactions = pageData?.content || []
			
			// Filtruj reakcje po typie
			const filteredReactions = reactions.filter(
				(reaction: TeamPostReactionResponseDto) => 
					reaction.reactionType?.id === reactionTypeId
			)
			
			// Pobierz dane użytkowników
			const usersData = await Promise.all(
				filteredReactions.map(async (reaction: TeamPostReactionResponseDto) => {
					try {
						const userResponse = await api.get(`/auth/user/${reaction.userId}`)
						return {
							userId: reaction.userId,
							name: userResponse.data.name || 'Nieznany użytkownik',
							avatarUrl: userResponse.data.urlOfPicture || null
						}
					} catch {
						return {
							userId: reaction.userId,
							name: 'Nieznany użytkownik',
							avatarUrl: null
						}
					}
				})
			)
			
			return usersData
		} catch (error) {
			console.error('Błąd pobierania użytkowników reakcji:', error)
			return []
		}
	}, [])

	return {
		getUserReaction,
		addOrUpdateReaction,
		deleteReaction,
		getReactionUsers, // Dodaj nową funkcję
	}
}

