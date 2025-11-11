import { useState, useCallback, useEffect } from 'react'
import { useEditor } from '@tiptap/react'
import api from '../Api/axios'
import type { TeamPostResponseDto, TeamPostPageResponse, TeamPostRequestDto, PostType } from '../Api/types/TeamPost'
import { extractMentionedUserIds } from '../utils/mentionUtils'

export const usePosts = (teamId: number) => {
	const [posts, setPosts] = useState<TeamPostResponseDto[]>([])
	const [loadingPosts, setLoadingPosts] = useState(false)
	const [page, setPage] = useState(0)
	const [hasNext, setHasNext] = useState(false)
	const [totalElements, setTotalElements] = useState(0)

	const fetchPosts = useCallback(async (pageNum: number, append: boolean = false) => {
		try {
			setLoadingPosts(true)

			const params = {
				page: pageNum,
				size: 20,
				sort: 'createdAt',
				direction: 'DESC' as const,
			}

			const response = await api.get<TeamPostPageResponse>(`/team-post/${teamId}`, { params })
			const data = response.data

			if (append) {
				setPosts(prev => [...prev, ...(data.content || [])])
			} else {
				setPosts(data.content || [])
			}
			setHasNext(!data.last)
			setTotalElements(data.totalElements)
			setPage(pageNum)
		} catch (error) {
			console.error('Błąd pobierania postów:', error)
		} finally {
			setLoadingPosts(false)
		}
	}, [teamId])

	useEffect(() => {
		fetchPosts(0, false)
	}, [fetchPosts])

	const createPost = useCallback(async (editor: ReturnType<typeof useEditor>, currentUserId: number) => {
		if (!editor || !currentUserId) {
			alert('Musisz być zalogowany, aby opublikować post')
			return
		}

		let htmlContent = editor.getHTML()
		let textContent = editor.getText().trim()

		if (!textContent || textContent === 'Wpisz swoją wiadomość tutaj...') {
			alert('Post nie może być pusty')
			return
		}

		try {
			const mentionedUserIds = extractMentionedUserIds(htmlContent)
			
			const postData: TeamPostRequestDto = {
				teamId,
				authorId: currentUserId,
				content: textContent,
				contentHtml: htmlContent,
				postType: 'TEXT' as PostType,
				mentionedUserIds: mentionedUserIds.length > 0 ? mentionedUserIds : undefined,
			}

			await api.post<TeamPostResponseDto>('/team-post', postData)
			
			editor.commands.clearContent()
			fetchPosts(0, false)
			return true
		} catch (error) {
			console.error('Błąd tworzenia posta:', error)
			alert('Nie udało się opublikować posta. Spróbuj ponownie.')
			return false
		}
	}, [teamId, fetchPosts])

	const updatePost = useCallback((postId: number, updates: Partial<TeamPostResponseDto>) => {
		setPosts(prev => prev.map(post => {
			if (post.postId === postId) {
				// Jeśli updates jest pełnym obiektem TeamPostResponseDto, zastąp całkowicie
				// W przeciwnym razie zaktualizuj tylko wskazane pola
				const updated = { ...post, ...updates }
				console.log('Updating post in state:', {
					postId,
					oldUpdatedAt: post.updatedAt,
					newUpdatedAt: updated.updatedAt,
					oldCreatedAt: post.createdAt,
					newCreatedAt: updated.createdAt
				})
				return updated
			}
			return post
		}))
	}, [])

	const updatePostAPI = useCallback(async (
		postId: number,
		editor: ReturnType<typeof useEditor>,
		currentUserId: number
	) => {
		if (!editor || !currentUserId) {
			alert('Musisz być zalogowany, aby edytować post')
			return false
		}

		let htmlContent = editor.getHTML()
		let textContent = editor.getText().trim()

		if (!textContent || textContent === 'Wpisz swoją wiadomość tutaj...') {
			alert('Post nie może być pusty')
			return false
		}

		try {
			const mentionedUserIds = extractMentionedUserIds(htmlContent)
			
			const postData: TeamPostRequestDto = {
				teamId,
				authorId: currentUserId,
				content: textContent,
				contentHtml: htmlContent,
				postType: 'TEXT' as PostType,
				mentionedUserIds: mentionedUserIds.length > 0 ? mentionedUserIds : undefined,
			}

			const response = await api.put<TeamPostResponseDto>(`/team-post/${postId}`, postData)
			const updatedPost = response.data
			
			// Debug: sprawdź czy updatedAt jest różne od createdAt
			console.log('Updated post:', {
				postId: updatedPost.postId,
				createdAt: updatedPost.createdAt,
				updatedAt: updatedPost.updatedAt,
				isDifferent: new Date(updatedPost.updatedAt).getTime() > new Date(updatedPost.createdAt).getTime() + 1000
			})
			
			// Aktualizuj post w liście - upewnij się że aktualizujemy cały obiekt
			updatePost(postId, updatedPost)
			return true
		} catch (error: any) {
			console.error('Błąd edycji posta:', error)
			const errorMessage = error.response?.data?.message || error.message || 'Nieznany błąd'
			alert(`Nie udało się zapisać zmian: ${errorMessage}`)
			return false
		}
	}, [teamId, updatePost])

	const deletePostAPI = useCallback(async (postId: number) => {
		try {
			await api.delete(`/team-post/${postId}`)
			
			// Aktualizuj post w liście - ustaw isDeleted na true i deletedAt
			updatePost(postId, {
				isDeleted: true,
				deletedAt: new Date().toISOString(),
			})
			return true
		} catch (error: any) {
			console.error('Błąd usuwania posta:', error)
			const errorMessage = error.response?.data?.message || error.message || 'Nieznany błąd'
			alert(`Nie udało się usunąć posta: ${errorMessage}`)
			return false
		}
	}, [updatePost])

	const restorePostAPI = useCallback(async (postId: number) => {
		try {
			await api.patch(`/team-post/${postId}/restore`)
			
			// Aktualizuj post w liście - ustaw isDeleted na false i deletedAt na null
			updatePost(postId, {
				isDeleted: false,
				deletedAt: null,
			})
			return true
		} catch (error: any) {
			console.error('Błąd przywracania posta:', error)
			const errorMessage = error.response?.data?.message || error.message || 'Nieznany błąd'
			alert(`Nie udało się przywrócić posta: ${errorMessage}`)
			return false
		}
	}, [updatePost])

	return {
		posts,
		loadingPosts,
		page,
		hasNext,
		totalElements,
		fetchPosts,
		createPost,
		updatePost,
		updatePostAPI,
		deletePostAPI,
		restorePostAPI,
	}
}

