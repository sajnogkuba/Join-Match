import { Link } from 'react-router-dom'
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
	// Znajdź ID drugiego użytkownika z wiadomości
	const otherUserMessage = messages.find(m => m.senderId !== myUserId)
	const otherUserId = otherUserMessage?.senderId

	return (
		<div className='flex flex-col flex-1 bg-zinc-950 min-h-0'>
			{activeConversation && (
				<div className='flex items-center gap-3 p-4 border-b border-zinc-800 bg-zinc-900 flex-shrink-0'>
					<Avatar
						src={activeConversation?.avatarUrl || messages.find(m => m.senderId !== myUserId)?.senderAvatarUrl}
						name={activeConversation?.name || messages.find(m => m.senderId !== myUserId)?.senderName || ''}
						size='sm'
						className='h-10 w-10'
					/>
					{activeConversation?.type === 'PRIVATE' && otherUserId ? (
						<Link
							to={`/profile/${otherUserId}`}
							className='text-white font-semibold hover:text-violet-400 transition-colors cursor-pointer'>
							{activeConversation.name}
						</Link>
					) : (
						<div className='text-white font-semibold'>
							{activeConversation?.type === 'TEAM'
								? `Czat drużyny: ${activeConversation.name}`
								: activeConversation?.type === 'EVENT'
								? `Czat wydarzenia: ${activeConversation.name}`
								: activeConversation?.name}
						</div>
					)}
				</div>
			)}
			<div className='flex-1 overflow-y-auto p-6 space-y-3 dark-scrollbar min-h-0'>
				{messages.map((m, i) => (
					<MessageBubble key={`${m.createdAt}-${i}`} message={m} isOwn={m.senderId === myUserId} />
				))}
			</div>
			<div className='flex gap-2 p-4 border-t border-zinc-800 bg-zinc-900 flex-shrink-0'>
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
