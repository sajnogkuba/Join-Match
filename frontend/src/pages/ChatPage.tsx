import React, { useEffect, useState } from 'react'
import ChatSidebar from '../components/ChatSidebar'
import ChatWindow from '../components/ChatWindow'
import { useChat } from '../Context/ChatContext'
import { useAuth } from '../Context/authContext'
import { useChatSocket } from '../hooks/useChatSocket'
import api from '../Api/axios'
import type { ChatMessage } from '../Context/ChatContext'
import { useLocation } from 'react-router-dom'

const ChatPage: React.FC = () => {
	const { accessToken } = useAuth()
	const [myUserId, setMyUserId] = useState<number | null>(null)

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
			console.log('🔴 myUserId is null, skip /conversations/preview')
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
		if (!conversationId) return

		setActiveConversation(conversationId)
		markConversationRead(conversationId)

		clearMessages(conversationId)

		api
			.get<ChatMessage[]>(`/conversations/${conversationId}/messages`)
			.then(res => {
				addMessages(conversationId, res.data)
			})
			.catch(err => console.error('❌ Błąd ładowania wiadomości', err))
	}, [conversationId])

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

	return (
		<div className='flex h-[calc(100vh-80px)] mt-20 bg-zinc-950'>
			<ChatSidebar conversations={conversations} activeId={conversationId} onSelect={setConversationId} />
			<ChatWindow
				messages={list}
				myUserId={myUserId ?? 0}
				input={input}
				setInput={setInput}
				onSend={handleSend}
				activeConversation={conversations.find(c => c.id === conversationId)}
			/>
		</div>
	)
}

export default ChatPage
