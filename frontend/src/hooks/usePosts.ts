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
		setPosts(prev => prev.map(post =>
			post.postId === postId
				? { ...post, ...updates }
				: post
		))
	}, [])

	return {
		posts,
		loadingPosts,
		page,
		hasNext,
		totalElements,
		fetchPosts,
		createPost,
		updatePost,
	}
}

