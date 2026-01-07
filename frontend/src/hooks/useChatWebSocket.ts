import { useEffect, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export const useChatWebSocket = () => {
	const [stompClient, setStompClient] = useState<Client | null>(null)
	const [isConnected, setIsConnected] = useState(false)

	useEffect(() => {
		let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'

		// Usuwamy '/api' tylko jeśli jest na samym końcu
		if (baseUrl.endsWith('/api')) {
			baseUrl = baseUrl.slice(0, -4)
		}

		// Teraz baseUrl to czyste "https://api.join-match.pl"
		const socket = new SockJS(`${baseUrl}/ws`)

		const client = new Client({
			webSocketFactory: () => socket,
			reconnectDelay: 0,
			debug: msg => console.log('💬 CHAT WS:', msg),
			onConnect: () => {
				setIsConnected(true)
			},
			onDisconnect: () => {
				setIsConnected(false)
			},
			onStompError: frame => {
				console.error('❌ STOMP error', frame)
			},
		})

		client.activate()
		setStompClient(client)

		return () => {
			client.deactivate()
			setStompClient(null)
			setIsConnected(false)
		}
	}, [])

	return { stompClient, isConnected }
}
