import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../Context/ChatContext'
import api from '../Api/axios'
import { useAuth } from '../Context/authContext'

interface ConversationPreview {
	id: number
	name: string
	avatarUrl?: string | null
	lastMessage?: string | null
	unreadCount?: number
}

const ChatBell: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false)
	const [conversations, setConversations] = useState<ConversationPreview[]>([])
	const dropdownRef = useRef<HTMLDivElement>(null)
	const navigate = useNavigate()
	const [loading, setLoading] = useState(false)
	const { accessToken } = useAuth()
	const [myUserId, setMyUserId] = useState<number | null>(null)
	const { totalUnreadConversations, markConversationRead } = useChat()

	useEffect(() => {
		const fetchUserId = async () => {
			if (!accessToken) return
			try {
				const res = await api.get('/auth/user', { params: { token: accessToken } })
				setMyUserId(res.data.id)
			} catch (err) {
				console.error('❌ Nie udało się pobrać userId:', err)
			}
		}
		fetchUserId()
	}, [accessToken])

	useEffect(() => {
		if (!isOpen || !myUserId) return
		setLoading(true)
		api
			.get('/conversations/preview', { params: { userId: myUserId } })
			.then(res => {
				console.log('📥 /conversations/preview data', res.data)
				setConversations(res.data)

			})
			.catch(err => {
				console.error('❌ /conversations/preview error:', err)
				setConversations([])
			})
			.finally(() => setLoading(false))
	}, [isOpen, myUserId])

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const handleOpenConversation = async (id: number) => {
		if (myUserId) {
			await api.post(`/conversations/${id}/read`, null, {
				params: { userId: myUserId },
			})
		}

		markConversationRead(id)
		setIsOpen(false)
		navigate('/chat', { state: { conversationId: id } })
	}

	return (
		<div className='relative' ref={dropdownRef}>
			{/* 🔔 Ikona chatu */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='relative p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors'
				title='Wiadomości'>
				<MessageSquare size={20} className='text-zinc-300' />
				{totalUnreadConversations > 0 && (
					<span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium'>
						{totalUnreadConversations > 99 ? '99+' : totalUnreadConversations}
					</span>
				)}
			</button>

			{/* 💬 Dropdown */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.15 }}
						className='absolute right-0 top-12 w-80 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden'>
						{/* Header */}
						<div className='flex items-center justify-between p-4 border-b border-zinc-800'>
							<h3 className='text-white font-semibold'>Wiadomości</h3>
							<button onClick={() => setIsOpen(false)} className='p-1 rounded-lg hover:bg-zinc-800 transition-colors'>
								<X size={16} className='text-zinc-400' />
							</button>
						</div>

						{/* Lista rozmów */}
						<div className='max-h-80 overflow-y-auto dark-scrollbar'>
							{loading ? (
								<div className='p-6 text-center text-zinc-400 text-sm'>Ładowanie...</div>
							) : conversations.length === 0 ? (
								<div className='p-6 text-center text-zinc-400 text-sm'>Brak rozmów</div>
							) : (
								conversations.map(conv => (
									<motion.div
										key={conv.id}
										onClick={() => handleOpenConversation(conv.id)}
										initial={{ opacity: 0, y: 5 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.2 }}
										className='flex items-center gap-3 p-3 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors'>
										<img
											src={conv.avatarUrl || '/default-avatar.png'}
											alt={conv.name}
											className='w-10 h-10 rounded-full object-cover'
										/>
										<div className='flex-1 min-w-0'>
											<div className='flex items-center justify-between'>
												<div className='text-white font-medium truncate'>{conv.name}</div>

												{conv.unreadCount && conv.unreadCount > 0 && (
													<span className='ml-2 bg-violet-600 text-white text-xs rounded-full h-5 min-w-5 px-2 flex items-center justify-center'>
														{conv.unreadCount > 99 ? '99+' : conv.unreadCount}
													</span>
												)}
											</div>

											<div className='text-sm text-zinc-400 truncate'>{conv.lastMessage || 'Brak wiadomości'}</div>
										</div>
									</motion.div>
								))
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export default ChatBell
