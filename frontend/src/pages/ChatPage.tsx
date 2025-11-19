import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ChatSidebar from '../components/ChatSidebar'
import ChatWindow from '../components/ChatWindow'
import { useChat } from '../Context/ChatContext'
import { useAuth } from '../Context/authContext'
import { useChatSocket } from '../hooks/useChatSocket'
import api from '../Api/axios'
import type { ChatMessage } from '../Context/ChatContext'
import { useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const ChatPage: React.FC = () => {
	const { accessToken } = useAuth()
	const [myUserId, setMyUserId] = useState<number | null>(null)
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

	const {
		messages,
		sendMessage,
		addMessage,
		addMessages,
		clearMessages,
		stompClient,
		isConnected,
		setActiveConversation,
		markConversationRead,
	} = useChat()

	const [conversations, setConversations] = useState<any[]>([])
	const [conversationId, setConversationId] = useState<number | null>(null)
	const [input, setInput] = useState('')
	const location = useLocation() as any
	const state = (location && location.state) || {}

	// Wykrywanie rozmiaru ekranu (mobile/desktop)
	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 768)
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Połączenie socketowe
	useChatSocket({
		stompClient,
		isConnected,
		conversationId,
		onNewMessage: msg => addMessage(msg),
	})

	useEffect(() => {
		const fetchUserId = async () => {
			try {
				if (!accessToken) return
				const res = await api.get('/auth/user', { params: { token: accessToken } })
				setMyUserId(res.data.id)
			} catch (err) {
				console.error('❌ Nie udało się pobrać userId:', err)
			}
		}
		fetchUserId()
	}, [accessToken])

	useEffect(() => {
		if (!myUserId) {
			console.log('ℹ️ myUserId is null, skip /conversations/preview')
			return
		}
		api
			.get(`/conversations/preview`, { params: { userId: myUserId } })
			.then(res => {
				setConversations(res.data)
			})
			.catch(err => console.error('❌ /conversations/preview error', err))
	}, [myUserId])

	useEffect(() => {
		if (!conversationId || !myUserId) return

		const markReadBackend = async () => {
			try {
				await api.post(`/conversations/${conversationId}/read`, null, {
					params: { userId: myUserId },
				})
				console.log('✔ Backend: conversation marked as read')
			} catch (err) {
				console.error('❌ Błąd markReadBackend', err)
			}
		}

		markReadBackend()

		setActiveConversation(conversationId)
		markConversationRead(conversationId)

		clearMessages(conversationId)

		api
			.get<ChatMessage[]>(`/conversations/${conversationId}/messages`)
			.then(res => {
				addMessages(conversationId, res.data)
			})
			.catch(err => console.error('❌ Błąd ładowania wiadomości', err))
	}, [conversationId, myUserId])

	useEffect(() => {
		const resolve = async () => {
			if (typeof state?.conversationId === 'number') {
				setConversationId(state.conversationId)
				return
			}

			if (typeof state?.targetUserId === 'number' && myUserId != null) {
				try {
					const res = await api.post('/conversations/direct', null, {
						params: { user1Id: myUserId, user2Id: state.targetUserId },
					})
					const cid = res.data?.id
					if (cid) setConversationId(cid)
				} catch (e) {
					console.error('Nie udało się utworzyć/odczytać rozmowy', e)
				}
			}
		}
		resolve()
	}, [state?.conversationId, state?.targetUserId, myUserId])

	const handleSend = () => {
		if (input.trim() && conversationId) {
			sendMessage(conversationId, input)
			setInput('')
		}
	}

	const list = conversationId ? messages[conversationId] || [] : []

	// Znajdź ID drugiego użytkownika z wiadomości (dla mobile nagłówka)
	const otherUserMessage = list.find(m => m.senderId !== myUserId)
	const otherUserId = otherUserMessage?.senderId

	// Powrót na mobile
	const handleBack = () => setConversationId(null)

	return (
		<div className='flex h-[calc(100vh-80px)] mt-[60px] md:mt-20 bg-zinc-950 min-h-0'>
			{/* Desktop: sidebar + chat obok siebie */}
			{!isMobile && (
				<>
					<ChatSidebar conversations={conversations} activeId={conversationId} onSelect={setConversationId} />
					<ChatWindow
						messages={list}
						myUserId={myUserId ?? 0}
						input={input}
						setInput={setInput}
						onSend={handleSend}
						activeConversation={conversations.find(c => c.id === conversationId)}
					/>
				</>
			)}

			{/* Mobile: przełączany widok */}
			{isMobile && (
				<>
					{!conversationId && (
						<ChatSidebar conversations={conversations} activeId={conversationId} onSelect={setConversationId} />
					)}
					{conversationId && (
						<div className='flex flex-col flex-1 min-h-0'>
							<div className='flex items-center gap-3 p-4 border-b border-zinc-800 bg-zinc-900 flex-shrink-0'>
								<button onClick={handleBack} className='text-white'>
									<ArrowLeft size={22} />
								</button>
								{otherUserId ? (
									<Link
										to={`/profile/${otherUserId}`}
										className='font-semibold text-white hover:text-violet-400 transition-colors cursor-pointer'>
										{conversations.find(c => c.id === conversationId)?.name || 'Rozmowa'}
									</Link>
								) : (
									<div className='font-semibold text-white'>
										{conversations.find(c => c.id === conversationId)?.name || 'Rozmowa'}
									</div>
								)}
							</div>
							<ChatWindow
								messages={list}
								myUserId={myUserId ?? 0}
								input={input}
								setInput={setInput}
								onSend={handleSend}
								activeConversation={conversations.find(c => c.id === conversationId)}
							/>
						</div>
					)}
				</>
			)}
		</div>
	)
}

export default ChatPage
