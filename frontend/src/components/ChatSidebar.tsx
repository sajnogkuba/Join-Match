import React from 'react'
import { MessageSquare } from 'lucide-react'
import { useChat } from '../Context/ChatContext'
import Avatar from './Avatar'

interface Conversation {
	id: number
	name: string
	avatarUrl?: string
	lastMessage?: string
	type?: 'PRIVATE' | 'TEAM' | 'EVENT'
}

interface ChatSidebarProps {
	conversations: Conversation[]
	activeId: number | null
	onSelect: (id: number) => void
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ conversations, activeId, onSelect }) => {
	const { unreadCounts } = useChat()

	return (
		<div className='w-full md:w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col'>
			<div className='flex items-center gap-2 p-4 text-lg font-semibold text-white border-b border-zinc-800'>
				<MessageSquare size={20} className='text-violet-400' />
				Twoje rozmowy
			</div>
			<div className='flex-1 overflow-y-auto dark-scrollbar'>
				{conversations.map(conv => (
					<div
						key={conv.id}
						onClick={() => onSelect(conv.id)}
						className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
							activeId === conv.id ? 'bg-violet-700/30' : 'hover:bg-zinc-800'
						}`}>
						<Avatar src={conv.avatarUrl || null} name={conv.name} size='sm' className='h-10 w-10' />
						<div className='flex-1 min-w-0'>
							<div className='text-white font-medium truncate'>
								{conv.type === 'EVENT'
									? `Wydarzenie: ${conv.name}`
									: conv.type === 'TEAM'
									? `Drużyna: ${conv.name}`
									: conv.name}
							</div>

							<div className='text-sm text-zinc-400 truncate'>{conv.lastMessage || 'Brak wiadomości'}</div>
						</div>
						{unreadCounts[conv.id] ? (
							<div className='bg-violet-600 text-xs text-white rounded-full px-2 py-0.5'>{unreadCounts[conv.id]}</div>
						) : null}
					</div>
				))}
			</div>
		</div>
	)
}

export default ChatSidebar
