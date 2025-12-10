import React, { useEffect, useState, useCallback } from 'react'
import { X, Search, UserPlus, Loader2 } from 'lucide-react'
import axiosInstance from '../Api/axios'
import Avatar from './Avatar'
import { getCookie } from '../utils/cookies'

import type { User } from '../Api/types/User'
import type { Friend, SearchResult } from '../Api/types/Friends'
import type { Participant as UserEventResponse } from '../Api/types/Participant'

interface InviteToEventModalProps {
	isOpen: boolean
	onClose: () => void
	onSubmit: (targetEmail: string) => void
	isSubmitting: boolean
	eventId: number
}

// MAPOWANIE STATUSÓW (PO NAZWIE Z BACKENDU)
const STATUS_MAP: Record<string, number> = {
	'Zapisany': 1,
	'Potwierdzony': 2,
	'Odrzucony': 3,
	'Oczekujący': 4,
	'Zaproszony': 5,
	'Wyrzucony': 6,
}

const InviteToEventModal: React.FC<InviteToEventModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	isSubmitting,
	eventId,
}) => {
	const [currentUser, setCurrentUser] = useState<User | null>(null)
	const [friends, setFriends] = useState<Friend[]>([])
	const [friendsLoading, setFriendsLoading] = useState(false)

	const [participants, setParticipants] = useState<Record<number, number>>({})

	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<SearchResult[]>([])
	const [searchLoading, setSearchLoading] = useState(false)

	// LOGIKA BLOKOWANIA PRZYCISKÓW
	const getInviteButtonState = (statusId?: number) => {
		switch (statusId) {
			case 1:
				return { label: 'Uczestnik', disabled: true }
			case 2:
				return { label: 'Potwierdzony', disabled: true }
			case 3:
				return { label: 'Odrzucony', disabled: true }
			case 4:
				return { label: 'Oczekujące', disabled: true }
			case 5:
				return { label: 'Zaproszony', disabled: true }
			case 6:
				return { label: 'Wyrzucony', disabled: true }
			default:
				return { label: 'Zaproś', disabled: false }
		}
	}

	// ŁADOWANIE DANYCH PRZY OTWARCIU
	useEffect(() => {
		if (!isOpen) return

		const load = async () => {
			try {
				const { data: usr } = await axiosInstance.get<User>('/auth/user')
				setCurrentUser(usr)

				setFriendsLoading(true)
				const { data: friendsData } = await axiosInstance.get<Friend[]>(`/friends/${usr.id}`)
				setFriends(friendsData ?? [])

				// pobranie uczestników
				const { data: ueData } = await axiosInstance.get<UserEventResponse[]>(
					`/user-event/${eventId}/participants`
				)

				// poprawne mapowanie
				const map: Record<number, number> = {}

				ueData.forEach(entry => {
					const statusId = STATUS_MAP[entry.attendanceStatusName] ?? undefined
					map[entry.userId] = statusId
				})

				setParticipants(map)
			} catch (err) {
				console.error('ERROR loading invite modal data:', err)
			} finally {
				setFriendsLoading(false)
			}
		}

		load()
	}, [isOpen, eventId])

	// WYSZUKIWARKA
	const searchUsers = useCallback(
		async (query: string) => {
			if (!query.trim()) {
				setSearchResults([])
				return
			}
			if (!currentUser) return

			setSearchLoading(true)
			try {
				const { data } = await axiosInstance.get<SearchResult[]>(
					`/auth/search?query=${encodeURIComponent(query)}&senderId=${currentUser.id}`
				)

				setSearchResults(data ?? [])
			} catch (err) {
				console.error('ERROR search:', err)
				setSearchResults([])
			} finally {
				setSearchLoading(false)
			}
		},
		[currentUser]
	)

	useEffect(() => {
		const t = setTimeout(() => searchUsers(searchQuery), 300)
		return () => clearTimeout(t)
	}, [searchQuery, searchUsers])

	// WYSYŁANIE ZAPROSZENIA
	const handleInvite = async (email: string, userId: number) => {
		onSubmit(email)

		// optymistyczne ustawienie "Zaproszony"
		setParticipants(prev => ({
			...prev,
			[userId]: 5,
		}))
	}

	const close = () => {
		setSearchQuery('')
		setSearchResults([])
		onClose()
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

			<div className="relative w-full max-w-4xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl">

				{/* HEADER */}
				<div className="flex items-center justify-between p-6 border-b border-zinc-800">
					<div>
						<h3 className="text-white text-xl font-semibold">Zaproś do wydarzenia</h3>
						<p className="text-xs text-zinc-400 mt-1">Wybierz znajomego lub wyszukaj użytkownika, aby wysłać zaproszenie.</p>
					</div>
					<button onClick={close} className="p-2 rounded-xl hover:bg-zinc-800 transition-colors">
						<X size={20} className="text-zinc-400 hover:text-white" />
					</button>
				</div>

				{/* BODY */}
				<div className="p-6 space-y-6">

					{/* WYSZUKIWARKA */}
					<div className="space-y-3">
						<label className="text-xs text-zinc-400">Szukaj użytkownika po nazwie lub emailu</label>

						<div className="relative">
							<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
							<input
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								placeholder="Zacznij pisać…"
								className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-9 py-2.5 text-sm text-white placeholder-zinc-500 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none"
							/>
						</div>

						<div className="max-h-64 overflow-y-auto space-y-2 dark-scrollbar">
							{searchLoading ? (
								<div className="py-6 text-center text-zinc-400 flex flex-col items-center gap-2">
									<Loader2 className="animate-spin" /> Szukanie…
								</div>
							) : searchQuery && searchResults.length === 0 ? (
								<div className="py-6 text-center text-zinc-500 text-sm">
									Brak wyników dla „{searchQuery}”
								</div>
							) : (
								searchResults.map(user => {
									const st = getInviteButtonState(participants[user.id])

									return (
										<div
											key={user.id}
											className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3"
										>
											<div className="flex items-center gap-3">
												<Avatar src={user.urlOfPicture} name={user.name} size="sm" />
												<div>
													<p className="text-white font-medium text-sm">{user.name}</p>
													<p className="text-xs text-zinc-400">{user.email}</p>
												</div>
											</div>

											<button
												disabled={isSubmitting || st.disabled}
												onClick={() => handleInvite(user.email, user.id)}
												className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium ${
													st.disabled
														? 'bg-zinc-700 text-zinc-400 cursor-default'
														: 'bg-violet-600 text-white hover:bg-violet-500'
												}`}
											>
												<UserPlus size={14} />
												{st.label}
											</button>
										</div>
									)
								})
							)}
						</div>
					</div>

					<hr className="border-zinc-800" />

					{/* LISTA ZNAJOMYCH */}
					<div className="space-y-3">
						<p className="text-sm text-white font-semibold">Twoi znajomi</p>

						<div className="max-h-64 overflow-y-auto space-y-2 dark-scrollbar">
							{friendsLoading ? (
								<div className="py-6 text-center text-zinc-400 flex flex-col items-center gap-2">
									<Loader2 className="animate-spin" /> Ładowanie znajomych…
								</div>
							) : friends.length === 0 ? (
								<p className="text-center text-zinc-500 py-4 text-sm">Brak znajomych.</p>
							) : (
								friends.map(friend => {
									const st = getInviteButtonState(participants[friend.id])

									return (
										<div
											key={friend.id}
											className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3"
										>
											<div className="flex items-center gap-3">
												<Avatar src={friend.urlOfPicture} name={friend.name} size="sm" />
												<div>
													<p className="text-white font-medium text-sm">{friend.name}</p>
													<p className="text-xs text-zinc-400">{friend.email}</p>
												</div>
											</div>

											<button
												disabled={isSubmitting || st.disabled}
												onClick={() => handleInvite(friend.email, friend.id)}
												className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium ${
													st.disabled
														? 'bg-zinc-700 text-zinc-400 cursor-default'
														: 'bg-violet-600 text-white hover:bg-violet-500'
												}`}
											>
												<UserPlus size={14} />
												{st.label}
											</button>
										</div>
									)
								})
							)}
						</div>
					</div>

				</div>
			</div>
		</div>
	)
}

export default InviteToEventModal
