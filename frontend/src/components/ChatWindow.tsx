import React, { useEffect, useRef } from 'react'
import type { ChatMessage } from '../Context/ChatContext'
import MessageBubble from './MessageBubble'
import Avatar from './Avatar'

interface ChatWindowProps {
	messages: ChatMessage[]
	myUserId: number
	input: string
	setInput: (v: string) => void
	onSend: () => void
	activeConversation?: any
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, myUserId, input, setInput, onSend, activeConversation }) => {
	const bottomRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	return (
		<div className='flex flex-col flex-1 bg-zinc-950'>
			{activeConversation && (
				<div className='flex items-center gap-3 p-4 border-b border-zinc-800 bg-zinc-900'>
					<Avatar
						src={activeConversation?.avatarUrl ?? '/default-avatar.png'}
						name={activeConversation?.name ?? ''}
						size='sm'
						className='h-10 w-10'
					/>
					<div className='text-white font-semibold'>{activeConversation.name}</div>
				</div>
			)}
			<div className='flex-1 overflow-y-auto p-6 space-y-3'>
				{messages.map((m, i) => (
					<MessageBubble key={`${m.createdAt}-${i}`} message={m} isOwn={m.senderId === myUserId} />
				))}
				<div ref={bottomRef} />
			</div>
			<div className='flex gap-2 p-4 border-t border-zinc-800 bg-zinc-900'>
				<input
					value={input}
					onChange={e => setInput(e.target.value)}
					onKeyDown={e => e.key === 'Enter' && onSend()}
					placeholder='Napisz wiadomość...'
					className='flex-1 bg-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none'
				/>
				<button onClick={onSend} className='bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-white'>
					Wyślij
				</button>
			</div>
		</div>
	)
}

export default ChatWindow
