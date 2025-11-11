import { useCallback } from 'react'
import api from '../Api/axios'
import type { TeamPostCommentReactionRequestDto, TeamPostCommentReactionResponseDto } from '../Api/types/TeamPostComment'

export const useCommentReactions = () => {
	const getUserReaction = useCallback(async (commentId: number, userId: number): Promise<number | null> => {
		try {
			const response = await api.get(`/reaction/team-post-comment/${commentId}`, {
				params: { page: 0, size: 100 }
			})
			
			const pageData = response.data
			const reactions = pageData?.content || []
			
			if (reactions.length === 0) {
				return null
			}
			
			const userReaction = reactions.find(
				(reaction: TeamPostCommentReactionResponseDto) => reaction.userId === userId
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
		commentId: number,
		userId: number,
		reactionTypeId: number,
		currentReactionCounts?: Record<number, number>,
		previousUserReactionTypeId?: number | null
	): Promise<Record<number, number> | null> => {
		try {
			const existingReactionTypeId = await getUserReaction(commentId, userId)
			
			const requestDto: TeamPostCommentReactionRequestDto = {
				userId,
				commentId,
				reactionTypeId,
			}

			let response: TeamPostCommentReactionResponseDto
			
			if (existingReactionTypeId !== null) {
				response = await api.patch<TeamPostCommentReactionResponseDto>(
					'/reaction/team-post-comment',
					requestDto
				).then(res => res.data)
			} else {
				try {
					response = await api.post<TeamPostCommentReactionResponseDto>(
						'/reaction/team-post-comment',
						requestDto
					).then(res => res.data)
				} catch (postError: any) {
					const errorMessage = postError.response?.data?.message || ''
					if (errorMessage.includes('duplicate key') || errorMessage.includes('unique_comment_reaction')) {
						response = await api.patch<TeamPostCommentReactionResponseDto>(
							'/reaction/team-post-comment',
							requestDto
						).then(res => res.data)
					} else {
						throw postError
					}
				}
			}

			try {
				const reactionsResponse = await api.get(`/reaction/team-post-comment/${commentId}`, {
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
				
				reactions.forEach((reaction: TeamPostCommentReactionResponseDto) => {
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
		commentId: number,
		userId: number,
		currentReactionCounts?: Record<number, number>,
		reactionTypeId?: number | null
	): Promise<Record<number, number> | null> => {
		try {
			const requestDto: TeamPostCommentReactionRequestDto = {
				userId,
				commentId,
				reactionTypeId: reactionTypeId || 0,
			}

			await api.delete('/reaction/team-post-comment', {
				data: requestDto
			})

			try {
				const reactionsResponse = await api.get(`/reaction/team-post-comment/${commentId}`, {
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
				
				reactions.forEach((reaction: TeamPostCommentReactionResponseDto) => {
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

	return {
		getUserReaction,
		addOrUpdateReaction,
		deleteReaction,
	}
}

