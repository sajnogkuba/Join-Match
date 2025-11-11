import { useState, useEffect, useCallback } from 'react'
import api from '../Api/axios'
import type { ReactionTypeResponseDto } from '../Api/types/ReactionType'

export const useReactionTypes = () => {
	const [reactionTypes, setReactionTypes] = useState<ReactionTypeResponseDto[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchReactionTypes = useCallback(async () => {
		try {
			setLoading(true)
			setError(null)
			const response = await api.get<ReactionTypeResponseDto[]>('/reaction/type')
			setReactionTypes(response.data)
		} catch (err) {
			console.error('Błąd pobierania typów reakcji:', err)
			setError('Nie udało się pobrać typów reakcji')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchReactionTypes()
	}, [fetchReactionTypes])

	return {
		reactionTypes,
		loading,
		error,
		refetch: fetchReactionTypes,
	}
}

