import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Bell, X, UserPlus, Clock, Users, UserMinus, MessageSquare, Heart } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useNotification } from '../Context/NotificationContext'
import type { Notification } from '../Api/types/Notification'
import { NotificationType } from '../Api/types/Notification'
import dayjs from 'dayjs'
import 'dayjs/locale/pl'

dayjs.locale('pl')

const NotificationBell: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false)
	const [showDetailModal, setShowDetailModal] = useState(false)
	const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const navigate = useNavigate()
	const { notifications, unreadCount, markAsRead } = useNotification()

	// Zamknij dropdown gdy klikniesz poza nim
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	// Zamknij modal po naciśnięciu Escape
	useEffect(() => {
		if (showDetailModal) {
			const handleEscape = (e: KeyboardEvent) => {
				if (e.key === 'Escape') {
					setShowDetailModal(false)
					setSelectedNotification(null)
				}
			}
			document.addEventListener('keydown', handleEscape)
			return () => document.removeEventListener('keydown', handleEscape)
		}
	}, [showDetailModal])

	const handleNotificationClick = async (notification: Notification) => {
		// Oznacz jako przeczytane
		if (!notification.isRead) {
			await markAsRead(notification.id)
		}

		// Zamknij dropdown
		setIsOpen(false)

		// Dla TEAM_MEMBER_REMOVED i TEAM_CANCELED otwórz modal zamiast przekierowania
		if (
			notification.type === NotificationType.TEAM_MEMBER_REMOVED ||
			notification.type === NotificationType.TEAM_CANCELED
		) {
			setSelectedNotification(notification)
			setShowDetailModal(true)
			return
		}

		// ➤ Event: ktoś poprosił o dołączenie – kieruje organizatora na event
		if (notification.type === NotificationType.EVENT_JOIN_REQUEST) {
			if (notification.data?.eventId) {
				navigate(`/event/${notification.data.eventId}`)
			}
			return
		}

		// ➤ Event: zaproszenie
		if (notification.type === NotificationType.EVENT_INVITATION) {
			if (notification.data?.eventId) {
				navigate(`/event/${notification.data.eventId}`)
			}
			return
		}

		if (
			notification.type === NotificationType.EVENT_INVITATION_ACCEPTED ||
			notification.type === NotificationType.EVENT_INVITATION_REJECTED
		) {
			if (notification.data?.eventId) {
				navigate(`/event/${notification.data.eventId}`)
			}
			return
		}

		// Przekieruj na podstawie typu powiadomienia
		if (notification.type === NotificationType.FRIEND_REQUEST) {
			// Sprawdź czy jesteś już na stronie profile
			if (window.location.pathname === '/profile') {
				window.location.href = '/profile#pending-requests'
			} else {
				navigate('/profile#pending-requests')
			}
		} else if (
			notification.type === NotificationType.FRIEND_REQUEST_ACCEPTED ||
			notification.type === NotificationType.FRIEND_REQUEST_REJECTED
		) {
			// Sprawdź czy jesteś już na stronie profile
			if (window.location.pathname === '/profile') {
				window.location.href = '/profile#friends'
			} else {
				navigate('/profile#friends')
			}
		} else if (
			notification.type === NotificationType.TEAM_REQUEST ||
			notification.type === NotificationType.TEAM_REQUEST_ACCEPTED ||
			notification.type === NotificationType.TEAM_REQUEST_REJECTED ||
			notification.type === NotificationType.TEAM_LEFT
		) {
			// Nawigacja do konkretnej drużyny
			if (notification.data?.teamId) {
				navigate(`/team/${notification.data.teamId}`)
			}
		} else if (notification.type === NotificationType.POST_COMMENT) {
			// Nawigacja do konkretnego posta
			if (notification.data?.postId) {
				navigate(`/post/${notification.data.postId}`)
			}
		} else if (notification.type === NotificationType.POST_REACTION) {
			// Nawigacja do konkretnego posta
			if (notification.data?.postId) {
				navigate(`/post/${notification.data.postId}`)
			}
		} else if (notification.type === NotificationType.COMMENT_REACTION) {
			if (notification.data?.postId && notification.data?.commentId) {
				navigate(`/post/${notification.data.postId}?highlightComment=${notification.data.commentId}`)
			}
		} else if (notification.type === NotificationType.COMMENT_REPLY) {
			if (notification.data?.postId && notification.data?.commentId) {
				navigate(`/post/${notification.data.postId}?highlightComment=${notification.data.commentId}`)
			}
		}
	}

	const formatTime = (createdAt: string | number[]) => {
		let notificationTime

		// Sprawdź czy data przychodzi jako tablica (format LocalDateTime z Java)
		if (Array.isArray(createdAt)) {
			// Konwertuj tablicę [year, month, day, hour, minute, second, nano] na Date
			const [year, month, day, hour, minute, second] = createdAt
			notificationTime = dayjs(new Date(year, month - 1, day, hour, minute, second))
		} else {
			notificationTime = dayjs(createdAt)
		}

		if (!notificationTime.isValid()) {
			console.error('Invalid date:', createdAt)
			return 'Nieznana data'
		}

		const now = dayjs()

		if (now.diff(notificationTime, 'minute') < 1) {
			return 'Teraz'
		} else if (now.diff(notificationTime, 'hour') < 1) {
			return `${now.diff(notificationTime, 'minute')} min temu`
		} else if (now.diff(notificationTime, 'day') < 1) {
			return `${now.diff(notificationTime, 'hour')} godz. temu`
		} else {
			return notificationTime.format('DD.MM.YYYY HH:mm')
		}
	}

	const getNotificationIcon = (type: NotificationType) => {
		switch (type) {
			case NotificationType.FRIEND_REQUEST:
				return <UserPlus size={16} className='text-violet-400' />
			case NotificationType.FRIEND_REQUEST_ACCEPTED:
				return <UserPlus size={16} className='text-green-400' />
			case NotificationType.FRIEND_REQUEST_REJECTED:
				return <UserPlus size={16} className='text-red-400' />
			case NotificationType.TEAM_REQUEST:
				return <Users size={16} className='text-violet-400' />
			case NotificationType.TEAM_REQUEST_ACCEPTED:
				return <Users size={16} className='text-green-400' />
			case NotificationType.TEAM_REQUEST_REJECTED:
				return <Users size={16} className='text-red-400' />
			case NotificationType.TEAM_LEFT:
				return <Users size={16} className='text-amber-400' />
			case NotificationType.TEAM_MEMBER_REMOVED:
				return <UserMinus size={16} className='text-red-400' />
			case NotificationType.TEAM_CANCELED:
				return <Users size={16} className='text-red-400' />
			case NotificationType.POST_COMMENT:
				return <MessageSquare size={16} className='text-violet-400' />
			case NotificationType.POST_REACTION:
				return <Heart size={16} className='text-violet-400' />
			case NotificationType.COMMENT_REACTION:
				return <Heart size={16} className='text-violet-400' />
			case NotificationType.COMMENT_REPLY:
				return <MessageSquare size={16} className='text-violet-400' />
			case NotificationType.EVENT_JOIN_REQUEST:
				return <Users size={16} className='text-violet-400' />
			case NotificationType.EVENT_INVITATION_ACCEPTED:
				return <Users size={16} className='text-green-400' />
			case NotificationType.EVENT_INVITATION_REJECTED:
				return <Users size={16} className='text-red-400' />
			case NotificationType.EVENT_INVITATION:
				return <UserPlus size={16} className='text-violet-400' />
			default:
				return <Bell size={16} className='text-zinc-400' />
		}
	}

	const extractReasonFromMessage = (message: string): string | null => {
		const reasonMatch = message.match(/Powód:\s*(.+)/)
		return reasonMatch ? reasonMatch[1].trim() : null
	}

	const getTeamNameFromMessage = (message: string): string | null => {
		// Format: "Zostałeś usunięty z drużyny {nazwa}" lub "Zostałeś usunięty z drużyny {nazwa}. Powód: ..."
		const teamMatch = message.match(/drużyny\s+([^.]+?)(?:\.\s*Powód:|$)/)
		return teamMatch ? teamMatch[1].trim() : null
	}

	const formatMessageWithTeamLink = (message: string, teamId?: number): React.ReactNode => {
		const teamName = getTeamNameFromMessage(message)
		if (!teamName || !teamId) {
			return message.split('. Powód:')[0]
		}

		// Znajdź pozycję nazwy drużyny w wiadomości
		const teamNameIndex = message.indexOf(teamName)
		if (teamNameIndex === -1) {
			return message.split('. Powód:')[0]
		}

		const beforeTeam = message.substring(0, teamNameIndex)
		const afterTeam = message.substring(teamNameIndex + teamName.length)
		const afterTeamWithoutReason = afterTeam.split('. Powód:')[0]

		return (
			<>
				{beforeTeam}
				<Link
					to={`/team/${teamId}`}
					className='text-violet-400 hover:text-violet-300 hover:underline font-medium inline'
					onClick={() => {
						setShowDetailModal(false)
						setSelectedNotification(null)
					}}>
					{teamName}
				</Link>
				{afterTeamWithoutReason}
			</>
		)
	}

	return (
		<div className='relative' ref={dropdownRef}>
			{/* Ikona dzwonka */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='relative p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors'
				title='Powiadomienia'>
				<Bell size={20} className='text-zinc-300' />
				{unreadCount > 0 && (
					<span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium'>
						{unreadCount > 99 ? '99+' : unreadCount}
					</span>
				)}
			</button>

			{/* Dropdown */}
			{isOpen && (
				<div className='absolute right-0 top-12 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg z-50 max-h-96 overflow-hidden'>
					{/* Header */}
					<div className='flex items-center justify-between p-4 border-b border-zinc-800'>
						<h3 className='text-white font-semibold'>Powiadomienia</h3>
						<button onClick={() => setIsOpen(false)} className='p-1 rounded-lg hover:bg-zinc-800 transition-colors'>
							<X size={16} className='text-zinc-400' />
						</button>
					</div>

					{/* Lista powiadomień */}
					<div className='max-h-80 overflow-y-auto dark-scrollbar'>
						{notifications.length === 0 ? (
							<div className='p-6 text-center'>
								<Bell size={32} className='mx-auto text-zinc-600 mb-2' />
								<p className='text-zinc-400 text-sm'>Brak powiadomień</p>
							</div>
						) : (
							notifications.map(notification => (
								<div
									key={notification.id}
									onClick={() => handleNotificationClick(notification)}
									className={`p-4 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors ${
										!notification.isRead ? 'bg-zinc-800/30' : ''
									}`}>
									<div className='flex items-start gap-3'>
										<div className='flex-shrink-0 mt-0.5'>{getNotificationIcon(notification.type)}</div>
										<div className='flex-1 min-w-0'>
											<div className='flex items-center gap-2 mb-1'>
												<h4 className='text-white font-medium text-sm truncate'>{notification.title}</h4>
												{!notification.isRead && <div className='w-2 h-2 bg-violet-500 rounded-full flex-shrink-0' />}
											</div>
											<p className='text-zinc-400 text-xs mb-2 line-clamp-2'>{notification.message}</p>
											<div className='flex items-center gap-1 text-xs text-zinc-500'>
												<Clock size={12} />
												<span>{formatTime(notification.createdAt)}</span>
											</div>
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			)}

			{/* Modal szczegółów powiadomienia o usunięciu - renderowany przez portal */}
			{showDetailModal &&
				selectedNotification &&
				createPortal(
					<div className='fixed inset-0 z-[9999] flex items-center justify-center p-4'>
						<div
							className='absolute inset-0 bg-black/60 backdrop-blur-sm'
							onClick={() => {
								setShowDetailModal(false)
								setSelectedNotification(null)
							}}
						/>
						<div className='relative w-full max-w-md rounded-2xl bg-zinc-900 p-6 ring-1 ring-zinc-800 shadow-2xl border border-red-500/30 bg-red-500/10'>
							<div className='flex items-start justify-between mb-4 gap-3'>
								<div className='flex items-center gap-3 flex-1 min-w-0'>
									<div className='p-2 rounded-xl bg-red-500/20 flex-shrink-0'>
										{selectedNotification.type === NotificationType.TEAM_CANCELED ? (
											<Users size={24} className='text-red-400' />
										) : (
											<UserMinus size={24} className='text-red-400' />
										)}
									</div>
									<h3 className='text-white text-lg font-semibold break-words'>{selectedNotification.title}</h3>
								</div>
								<button
									onClick={() => {
										setShowDetailModal(false)
										setSelectedNotification(null)
									}}
									className='p-1.5 rounded-xl hover:bg-zinc-800 transition-colors flex-shrink-0'>
									<X size={20} className='text-zinc-400 hover:text-white' />
								</button>
							</div>

							<div className='space-y-4 mb-6'>
								<div>
									<p className='text-zinc-300 text-sm mb-2 break-words whitespace-pre-wrap'>
										{formatMessageWithTeamLink(selectedNotification.message, selectedNotification.data?.teamId)}
									</p>
								</div>

								{extractReasonFromMessage(selectedNotification.message) && (
									<div className='rounded-xl border border-zinc-800 bg-zinc-800/60 p-4'>
										<h4 className='text-white font-medium text-sm mb-2'>
											{selectedNotification.type === NotificationType.TEAM_CANCELED
												? 'Powód rozwiązania:'
												: 'Powód usunięcia:'}
										</h4>
										<p className='text-zinc-300 text-sm break-words whitespace-pre-wrap'>
											{extractReasonFromMessage(selectedNotification.message)}
										</p>
									</div>
								)}

								<div className='flex items-center gap-2 text-xs text-zinc-500 pt-2 border-t border-zinc-800'>
									<Clock size={14} />
									<span>{formatTime(selectedNotification.createdAt)}</span>
								</div>
							</div>

							<div className='flex justify-end'>
								<button
									onClick={() => {
										setShowDetailModal(false)
										setSelectedNotification(null)
									}}
									className='rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors'>
									Zamknij
								</button>
							</div>
						</div>
					</div>,
					document.body
				)}
		</div>
	)
}

export default NotificationBell
