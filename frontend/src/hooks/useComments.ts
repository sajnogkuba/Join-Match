import { useState, useCallback } from 'react'
import api from '../Api/axios'
import type { TeamPostCommentResponseDto, TeamPostCommentPageResponse, TeamPostCommentRequestDto } from '../Api/types/TeamPostComment'

export const useComments = () => {
	const [comments, setComments] = useState<Map<number, TeamPostCommentResponseDto[]>>(new Map())
	const [loadingComments, setLoadingComments] = useState<Map<number, boolean>>(new Map())
	const [commentTexts, setCommentTexts] = useState<Map<number, string>>(new Map())
	const [replyTexts, setReplyTexts] = useState<Map<string, string>>(new Map())
	const [postingComment, setPostingComment] = useState<Map<number, boolean>>(new Map())
	const [showComments, setShowComments] = useState<Map<number, boolean>>(new Map())
	const [commentPages, setCommentPages] = useState<Map<number, number>>(new Map())
	const [commentHasNext, setCommentHasNext] = useState<Map<number, boolean>>(new Map())
	const [replyingToComment, setReplyingToComment] = useState<Map<string, number | null>>(new Map())

	const fetchComments = useCallback(async (postId: number, append: boolean = false) => {
		try {
			setLoadingComments(prev => new Map(prev).set(postId, true))

			const currentPage = append ? (commentPages.get(postId) || 0) + 1 : 0
			
			const params = {
				page: currentPage,
				size: 12,
				sort: 'createdAt',
				direction: 'DESC' as const,
			}

			const response = await api.get<TeamPostCommentPageResponse>(`/comment/${postId}`, { params })
			const data = response.data

			if (append) {
				setComments(prev => {
					const newMap = new Map(prev)
					const existingComments = newMap.get(postId) || []
					newMap.set(postId, [...existingComments, ...(data.content || [])])
					return newMap
				})
			} else {
				setComments(prev => new Map(prev).set(postId, data.content || []))
			}

			setCommentPages(prev => new Map(prev).set(postId, currentPage))
			setCommentHasNext(prev => new Map(prev).set(postId, !data.last))
		} catch (error) {
			console.error('Błąd pobierania komentarzy:', error)
			if (!append) {
				setComments(prev => new Map(prev).set(postId, []))
			}
		} finally {
			setLoadingComments(prev => new Map(prev).set(postId, false))
		}
	}, [commentPages])

	const fetchReplies = useCallback(async (parentCommentId: number) => {
		try {
			let postId = 0
			for (const [pid, commentsList] of comments.entries()) {
				const comment = commentsList.find(c => c.commentId === parentCommentId)
				if (comment) {
					postId = pid
					break
				}
			}
			
			if (postId > 0) {
				await fetchComments(postId, false)
			}
		} catch (error) {
			console.error('Błąd pobierania odpowiedzi:', error)
		}
	}, [comments, fetchComments])

	const postComment = useCallback(async (postId: number, currentUserId: number, parentCommentId: number | null = null) => {
		if (!currentUserId) {
			alert('Musisz być zalogowany, aby dodać komentarz')
			return
		}

		const key = parentCommentId ? `${postId}-${parentCommentId}` : `${postId}-main`
		const content = parentCommentId 
			? (replyTexts.get(key)?.trim() || '')
			: (commentTexts.get(postId)?.trim() || '')
		
		if (!content) {
			alert('Komentarz nie może być pusty')
			return
		}

		setPostingComment(prev => new Map(prev).set(postId, true))

		try {
			const commentData: TeamPostCommentRequestDto = {
				postId,
				authorId: currentUserId,
				parentCommentId: parentCommentId,
				content,
			}

			await api.post<TeamPostCommentResponseDto>('/comment', commentData)
			
			if (parentCommentId) {
				setReplyTexts(prev => {
					const newMap = new Map(prev)
					newMap.set(key, '')
					return newMap
				})
			} else {
				setCommentTexts(prev => {
					const newMap = new Map(prev)
					newMap.set(postId, '')
					return newMap
				})
			}
			
			setReplyingToComment(prev => {
				const newMap = new Map(prev)
				newMap.set(key, null)
				return newMap
			})

			if (parentCommentId) {
				await fetchReplies(parentCommentId)
			} else {
				await fetchComments(postId, false)
			}
		} catch (error) {
			console.error('Błąd tworzenia komentarza:', error)
			alert('Nie udało się dodać komentarza. Spróbuj ponownie.')
		} finally {
			setPostingComment(prev => new Map(prev).set(postId, false))
		}
	}, [replyTexts, commentTexts, fetchReplies, fetchComments])

	const groupComments = (commentsList: TeamPostCommentResponseDto[]) => {
		const mainComments = commentsList.filter(c => !c.parentCommentId)
		const repliesMap = new Map<number, TeamPostCommentResponseDto[]>()
		
		commentsList.forEach(comment => {
			if (comment.parentCommentId) {
				const parentId = comment.parentCommentId
				if (!repliesMap.has(parentId)) {
					repliesMap.set(parentId, [])
				}
				repliesMap.get(parentId)!.push(comment)
			}
		})

		return { mainComments, repliesMap }
	}

	const toggleComments = (postId: number) => {
		const isShowing = showComments.get(postId) || false
		setShowComments(prev => new Map(prev).set(postId, !isShowing))
		
		if (!isShowing && !comments.has(postId)) {
			fetchComments(postId, false)
		}
	}

	const loadMoreComments = async (postId: number) => {
		await fetchComments(postId, true)
	}

	const updateComment = useCallback((postId: number, commentId: number, updates: Partial<TeamPostCommentResponseDto>) => {
		setComments(prev => {
			const newMap = new Map(prev)
			const postComments = newMap.get(postId) || []
			const updatedComments = postComments.map(comment => 
				comment.commentId === commentId 
					? { ...comment, ...updates }
					: comment
			)
			newMap.set(postId, updatedComments)
			return newMap
		})
	}, [])

	const updateCommentAPI = useCallback(async (
		postId: number,
		commentId: number,
		content: string
	) => {
		try {
			// Znajdź komentarz w stanie
			const postComments = comments.get(postId) || []
			const comment = postComments.find(c => c.commentId === commentId)
			if (!comment) {
				alert('Komentarz nie został znaleziony')
				return false
			}

			const commentData: TeamPostCommentResponseDto = {
				...comment,
				content,
			}

			const response = await api.put<TeamPostCommentResponseDto>('/comment', commentData)
			const updatedComment = response.data
			
			// Aktualizuj komentarz w liście
			updateComment(postId, commentId, updatedComment)
			return true
		} catch (error: any) {
			console.error('Błąd edycji komentarza:', error)
			const errorMessage = error.response?.data?.message || error.message || 'Nieznany błąd'
			alert(`Nie udało się zapisać zmian: ${errorMessage}`)
			return false
		}
	}, [comments, updateComment])

	// Funkcja pomocnicza do formatowania daty jako LocalDateTime (bez strefy czasowej)
	const formatLocalDateTime = (date: Date): string => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		const hours = String(date.getHours()).padStart(2, '0')
		const minutes = String(date.getMinutes()).padStart(2, '0')
		const seconds = String(date.getSeconds()).padStart(2, '0')
		return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
	}

	const deleteCommentAPI = useCallback(async (postId: number, commentId: number) => {
		try {
			await api.delete(`/comment/${commentId}`)
			
			// Aktualizuj komentarz w liście - ustaw isDeleted na true i deletedAt
			// Używamy formatLocalDateTime zamiast toISOString(), aby zachować lokalną strefę czasową
			updateComment(postId, commentId, {
				isDeleted: true,
				deletedAt: formatLocalDateTime(new Date()),
			})
			return true
		} catch (error: any) {
			console.error('Błąd usuwania komentarza:', error)
			const errorMessage = error.response?.data?.message || error.message || 'Nieznany błąd'
			alert(`Nie udało się usunąć komentarza: ${errorMessage}`)
			return false
		}
	}, [updateComment])

	const restoreCommentAPI = useCallback(async (postId: number, commentId: number) => {
		try {
			await api.patch(`/comment/${commentId}/restore`)
			
			// Aktualizuj komentarz w liście - ustaw isDeleted na false i deletedAt na null
			updateComment(postId, commentId, {
				isDeleted: false,
				deletedAt: null,
			})
			return true
		} catch (error: any) {
			console.error('Błąd przywracania komentarza:', error)
			const errorMessage = error.response?.data?.message || error.message || 'Nieznany błąd'
			alert(`Nie udało się przywrócić komentarza: ${errorMessage}`)
			return false
		}
	}, [updateComment])

	return {
		comments,
		loadingComments,
		commentTexts,
		replyTexts,
		postingComment,
		showComments,
		commentHasNext,
		replyingToComment,
		setCommentTexts,
		setReplyTexts,
		setReplyingToComment,
		fetchComments,
		postComment,
		groupComments,
		toggleComments,
		loadMoreComments,
		updateComment,
		updateCommentAPI,
		deleteCommentAPI,
		restoreCommentAPI,
	}
}

